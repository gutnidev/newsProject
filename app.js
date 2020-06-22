
//! Объявления переменных
	const submitSearchForm = document.getElementById(`submitSearchForm`);
	const form = document.forms[`newsForm`];
	const myHttp  = function customHttp() {
		function callBack(err, res) {
			if((Math.floor(err / 100) !== 2) || err === 0){
				console.log(err);
				console.log(`Работает внутренний колбек пользовательского объекта myHttp, передайте свой колбэк в качестве последнего аргумента вызываемого метода`);

			}else {
				console.log(err, res);
				console.log(`Работает внутренний колбек пользовательского объекта myHttp, передайте свой колбэк в качестве последнего аргумента вызываемого метода`);
			}
			
		}
		return function () {
			return{
				get(url,cb = callBack){
					try{
						const xhr = new XMLHttpRequest();
					xhr.open('GET', url);
					xhr.addEventListener("load", ()=>{
						if (Math.floor(xhr.status / 100) !== 2){
							cb(xhr.status, xhr);
							return;
						}
						cb(xhr.status, JSON.parse(xhr.responseText));
					});
					xhr.addEventListener("error", () =>{
						cb(xhr.status, xhr);
					});
					xhr.send();
					}catch (error) {
						cb(error);
					}
					
				},
				post(url, body, headers,cb = callBack){
					try{
						const xhr = new XMLHttpRequest();
						xhr.open('POST', url);
						if (headers) {
				          Object.entries(headers).forEach(([key, value]) => {
				            xhr.setRequestHeader(key, value);
				          });
				        }
						xhr.addEventListener("load", ()=>{
							if ((Math.floor(xhr.status / 100) !== 2)){
								cb(xhr.status, xhr);
								return;
							}
							cb(xhr.status, JSON.parse(xhr.responseText));
						});
						xhr.addEventListener("error", () =>{
							cb(xhr.status, xhr);
						});
						xhr.send(JSON.stringify(body));
					}catch (error) {
						cb(error);
					}
				},
			};
		}
		
	}()();
	const collapseSearch = document.getElementById(`collapseSearch`);
	//? Объект отвечает за взаимодействие с сервером
	const newsService = function(){
		const apiKey = 'aca46562bcce4e8aa03a8a6a7229af7f';
		const apiUrl = 'https://news-api-v2.herokuapp.com/';
		
		return{
			topHeadlines(country = 'ua', category,cb){
				
				myHttp.get(`${apiUrl}top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,cb);
			},
			everything(query, cb){
				myHttp.get(`${apiUrl}everything?q=${query}&apiKey=${apiKey}`,cb);
			},
			
		};
	}();
	
	//! Объявление ф-ций
	//? Хэндлер для САБМИТА
	function searchFormSubmitHandler(e){
		e.preventDefault();
		
		collapseSearch.classList.remove(`show`);
		
		loadNews(e.target.elements[`selectCountry`].value, e.target.elements[`inputSearchNews`].value, e.target.elements[`selectCategory`].value);
		e.target.elements[`inputSearchNews`].value = ``;
		
	}
	//? Эта функция запускает запросы из объекта, который отвечает за работу с сервером
	function loadNews(country = `ua`, query = ``, category = `general`) {
		showLoader();
		delOldCard();
		if (query){
			newsService.everything(query,onGetResponce);
		}else if(country){
			
			newsService.topHeadlines(country, category, onGetResponce);
		}
		
	}
	//? Callback, который передается в сервис работы с сервером, а оттуда в myHttp.
	function onGetResponce(err, res) {
		
		if((Math.floor(err / 100) !== 2) || err === 0){
			
			errFunk(err);
		}else {
			renderNews(res);
			
			noResult(res);
		}
	}
	//? Функция рендеринга ответа сервера
	function renderNews(result) {
		
		const{articles}=result;
		const newsContainer = document.getElementsByClassName(`newsContainer`)[0];
		let fragment = ``;
		articles.forEach(article =>{
			const card = cardTemplate(article);
			fragment +=card;
		});
		
		newsContainer.insertAdjacentHTML('afterbegin', fragment);
		hideLoader();
		
	}
	//? Функция подставляет значение в html код с возвращает одну карту в виде html текста
	function cardTemplate({title, description, url, urlToImage= `defNewsImage.jpeg`}) {
		
		return`
			<div class="col mb-4 colForOneCard">
                    <div class="card shadow mb-5 p-1 rounded h-100">
                        <div>
                            <div class="forImg position-relative bg-secondary">
                                <a href="${url}" class="" target="_blank">
                                    <img src="${urlToImage || `images/defNewsImage.jpeg`}" class="card-img" alt="">
                                    <div class="card-img-overlay imageText overflow-auto p-2">
                                        <span class="card-text text-white">"${title || ` `}"</span>
                                    </div>
                                </a>
                            </div>
                            <div class="card-body">
                                <span class="card-text text-dark">"${description || ` Чтобы узнать подробнее нажамите на картинку`}"</span>
                            </div>
                        </div>
                        <div class="card-footer mt-auto">
                                <a class="card-text text-primary" href="${url}" target="_blank">Подробнее</a>
                        </div>
                    </div>
            </div>
		`;
	}
	//? Функция удаляет старые карточки при новом запросе
	function delOldCard() {
		let old = document.querySelectorAll(`.colForOneCard`);
			for (let i=0; i<old.length;i++){
				old[i].remove();
			}
	}
	//? показываем и прячем лоадер лоадер
	function showLoader() {
		let loader = `
		<div class="loader ">
  			<div class="loader_inner"></div>
		</div>
		`;
		const body = document.body;
		body.insertAdjacentHTML("beforeend", loader);
	}
	function hideLoader() {
		document.querySelector(`.loader`).remove();
	}
	//? Тут мы выводим отсутствие результатов поиска
	function noResult(res) {
		if(document.querySelector(`.noResContainer`)){
			document.querySelector(`.noResContainer`).remove();
			document.querySelector(`.footer`).classList.remove(`fixed-bottom`);
		}
		if(!res[`totalResults`]){
			document.querySelector(`.footer`).classList.add(`fixed-bottom`);
			document.querySelector(`.head`).insertAdjacentHTML(`beforeend`, `
			<div class="container noResContainer" >
				        <div class="row">
				            <div class="col-6 col-lg-5 m-auto ">
				                <div class="card border-0 ">
				                    <img src="images/noRes.jpg" class="card-img noRes"/>
				                </div>
	
				            </div>
				        </div>
	            </div>
			`);
		}
	}
	//? Обработчик обшибок
	function errFunk(err) {
		switch (err) {
		  case 400:
		    alert( `ошибка ${err}: Bad Request. The request was unacceptable, often due to a missing or misconfigured parameter.` );
		    break;
		  case 401:
		    alert( `ошибка ${err}: Unauthorized. Your API key was missing from the request, or wasn't correct.` );
		    break;
		    case 429:
		    alert( `ошибка ${err}: Too Many Requests. You made too many requests within a window of time and have been rate limited. Back off for a while.` );
		    break;
		    case 500:
		    alert( `ошибка ${err}: Server Error. Something went wrong on our side.` );
		    break;
		  default:
		    alert( `Произошла какая-то ошибка` );
		}
	}
	
	loadNews();

	
	form.addEventListener(`submit`, searchFormSubmitHandler);
