(() => {

	const config = {
		time : 120000
	};

	const ids = [
		'be0b8279ed72d1e319ae88d52b2d56b565ab36f377b4e4d1de8461caa0756865',
		'eebdb2ac0bf67cacca4c2f3f7eaf8ae003ed8f1867416e63d23e4ebd84d6b90d',
		'3867c0fcc19bec7ab7ee29f3535227b3ed5262839a76144c10c5aeefd8baab54'
	];

	const Timer = function() {
		let timeout = 0;
		
		function delay (callback, ms) {
			delay.cancell(timeout);
			timeout = setTimeout(callback, ms);
		};

		delay.cancell = function () {
			clearTimeout(timeout);
		};

		return delay;
	};

	let wheelTimeout;

	let nextPhotoTimeout;

	const photoArray = [];

	class Element {

		constructor (tag, className, innerHTML) {

			this.reference = document.createElement(tag);
			this.reference.className = className;
			this.reference.innerHTML = innerHTML;

			return this.reference;
		}
	}

	const Program = {

		init () {

			this.createPlayButton();
			this.events();
			this.showControlsTimer = new Timer();

			console.log('this.showControlsTimer', this.showControlsTimer)

			return this;
		},

		events () {

			const { body } = document;
			const { playButton } = this;

			body.addEventListener('dblclick', this.eventsFns.fullScreen);

			body.addEventListener('mousewheel', this.eventsFns.changePhoto);

			body.addEventListener('mousemove', this.eventsFns.handleMouseMove.call(this));

			playButton.addEventListener('click', this.eventsFns.playPause.bind(this));
		},

		eventsFns : {

			fullScreen () {

				const isFullScreen = window.innerHeight == screen.height;

				if( isFullScreen ) {
					document.webkitExitFullscreen();
				} else {
					document.body.webkitRequestFullScreen();
				}
			},

			changePhoto (event) {
				
				clearTimeout(wheelTimeout);
				clearTimeout(nextPhotoTimeout);

				wheelTimeout = setTimeout(() => {
					nextPhotoTimeout = Photos.setPhoto();
				}, 200);
			},

			showControls (event) {
				
				const { className } = document.body;

				Program.showControlsTimer(() => {
					const { className } = document.body.className.replace(' active', '');
					Object.assign(document.body, { className });
					// photoLayer.style.setProperty('cursor', 'none', 'important');
				}, 2000);

				if(~className.indexOf('active')) return;

				document.body.className += ' active';
				// photoLayer.style.setProperty('cursor', 'default', 'important');
			},

			handleMouseMove () {

				const timer = new Timer();

				return event => {

					timer(() => {

						this.eventsFns.showControls(event);
						this.eventsFns.setPerspective.call(this, event);
					});
				};
			},

			setPerspective (event) {

				const center = {
					x : window.innerWidth/2,
					y : window.innerHeight/2
				};

				const distanceToTheCenter = {
					x : event.x / center.x - 1,
					y : event.y / center.y - 1,
					total : Math.sqrt(Math.pow(event.x / center.x - 1, 2) + Math.pow(event.y / center.y - 1, 2))
				};

				this.playButton.style.transform = `
					translate(${12*distanceToTheCenter.x}px, ${12*distanceToTheCenter.y}px)
				`;

				/*
				 this.playButton.style.filter = `
					blur(${Math.pow(distanceToTheCenter.total, 2)}px)
				`;*/

				photoLayer.style.transform = `translate(${-20*distanceToTheCenter.x}px, ${-20*distanceToTheCenter.y}px)`;
			},

			playPause () {

				const { className } = this.playButton.className.replace(/play|pause/, match => match !== 'play' ? 'play' : 'pause');

				Object.assign(this.playButton, { className });

				document.querySelector('#player .play').click();
			}
		},

		createPlayButton () {

			this.playButton = new Element('div', 'control pause', '<span class="left"></span><span class="right"></span>');
			document.body.appendChild(this.playButton);
		}

	}.init();


	const changeVolume = () => {

		$('.slider-track')
			.trigger('mousedown')
			.trigger('mouseup')
			.on('mousedown', event => console.log(event))
	}

	const ajax = (url, option = 0) => {

		return new Promise((resolve, reject) => {

			const xhttp = new XMLHttpRequest();
			
			xhttp.open('GET', 'https://api.unsplash.com' + url);
			xhttp.setRequestHeader('Authorization', `Client-ID ${ids[option]}`);

			xhttp.onreadystatechange = () => {

				console.log('onreadystatechange');
				console.log('xhttp.readyState', xhttp.readyState);
				console.log('xhttp.status', xhttp.status);

				if(xhttp.status == 200) {

					resolve(JSON.parse(xhttp.responseText));
				
				} else if (xhttp.status == 403 && option+1 < ids.length) {

					ajax(url, option+1).then(data => resolve(data));
				}
			};

			xhttp.send();
		});
	}

	class Photo {

		constructor (photoData) {

			this.data = photoData;
		}

		preLoad () {

			return new Promise((resolve, reject) => {
				const url = this.data.urls.custom;
				const image = new Image(); image.src = url;
				image.onload = () => resolve(url);
			});
		}

		genRandom () {

			return ajax(`/photos/random?featured=true&w=2000&h=1125`).then(photoData => {
				this.data = photoData;
			});
		}

		getWideResolution () {

			return ajax(`/photos/${this.data.id}?w=2000&h=1125`).then(photoData => {
				this.data = photoData;
			});
		}

		get URL () {
			return this.data.urls.custom;
		}

		get userName () {
			return this.data.user.name;
		}

		get userBio () {
			return this.data.user.bio;
		}

		get userPortfolioURL () {
			return this.data.user.portfolio_url;
		}

		get userLink () {
			return this.data.user.links.html;
		}

		get userThumb () {
			return this.data.user.profile_image.small;
		}

		get downloadLink () {
			return this.data.links.download;
		}
	}

	const Photos = {

		constructor  () {

			this.getCuratedPhotos().then(photos => {

				this.setPhoto();
			});
		},

		setPhoto () {

			const photo = new Photo();

			photo.genRandom().then(() => {
				photo.preLoad().then(() => {
					photoArray.push[photo];
					this.showPhoto(photo);
					this.setNextChange();
				});
			});
		},

		showPhoto (photo) {

			this._faded();
			
			// Set image
			photoLayer.style.background = `url(${photo.URL})`;

			// Set author data
			author.innerHTML = `<img width="32" height="32" src="${photo.userThumb}"><span>${photo.userName}</span>`;
			author.setAttribute('href', photo.userLink);
			author.setAttribute('title', photo.userBio);

			// Set download link
			download.setAttribute('download', photo.downloadLink);
			download.setAttribute('href', photo.downloadLink);
		},

		setNextChange () {

			nextPhotoTimeout = setTimeout(this.setPhoto.bind(this), config.time);
		},

		_faded () {
			
			const cloned = photoLayer.cloneNode();
			document.body.appendChild(cloned);
			cloned.className += ' removing';

			setTimeout(() => {
				cloned.remove();
			}, config.time);
		},

		getCuratedPhotos () {
			
			return ajax('/photos/curated/');
		}
	}

	const photoLayer = document.createElement('div');
	photoLayer.className = 'layer';
	document.body.appendChild(photoLayer);

	const author = document.createElement('a');
	author.className = 'author';
	author.setAttribute('target', '_blank');
	document.body.appendChild(author);

	const download = document.createElement('a');
	download.className = 'download';
	download.setAttribute('target', '_blank');
	download.innerHTML = 'Descargar';
	document.body.appendChild(download);

	const unsplashLink = document.createElement('a');
	unsplashLink.className = 'unsplash-link';
	unsplashLink.setAttribute('href', 'https://unsplash.com/');
	unsplashLink.setAttribute('target', '_blank');
	unsplashLink.innerHTML = 'powered by <span>Unsplash</span>';
	document.body.appendChild(unsplashLink);

	Photos.constructor();

})();