class Clock {
	timerM = 20;
	timerS = 0;
	timer;
	r(time) {
		if (time < 10) return '0' + time;
		return time;
	}
	constructor(container) {
		this.Init(container);
		this.Start(container);
	}
	Init(container) {
		$(container).append("<p>Времени осталось</p>");
		$(container).append("<div class='clock-face'></div>")
		$(container).children('.clock-face').append("<span class='clock-sect' id='timerM'>" + this.r(this.timerM) + "</span>");
		$(container).children('.clock-face').append("<span> : </span>");
		$(container).children('.clock-face').append("<span class='clock-sect' id='timerS'>" + this.r(this.timerS) + "</span>");
	}
	Start(container) {
		this.timer = setInterval(() => {
			if (this.timerS == 0) {
				if (this.timerM == 0) {
					clearInterval(this.timer);
				} else {
					this.timerM--;
					this.timerS = 59;
				}
			} else {
				this.timerS--;
			}
			$(container).children('.clock-face').children('#timerM').html(this.r(this.timerM));
			$(container).children('.clock-face').children('#timerS').html(this.r(this.timerS));
		}, 1000);
	}
	Stop() {
		clearInterval(this.timer);
	}
	GetM(type) {
		if (type)
			return 19 - this.timerM;
		else
			return this.timerM;
	}
	GetS(type) {
		if (type)
			return 60 - this.timerS;
		else
			return this.timerS;
	}
}