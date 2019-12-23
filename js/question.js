class Question {


	toString() {
		let res = "";
		for (let i = 0; i < this.answers.length; i++) {
			res += this.answers[i].text + ' -> ' + this.answers[i].isCorrect + '\n';
		}
		return res;
	}

	constructor(input) {
		this.theme = input.theme;
		this.title = input.title;
		this.answers = input.answers;
		this.initGif = input.initGif;
	}
}