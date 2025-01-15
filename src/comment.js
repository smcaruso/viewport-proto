export default class Comment {

  constructor(comment) {

    this.console = document.getElementById("proto-console")
    this.message = document.createElement("div")
    this.message.classList.add("message")
    this.message.innerText = comment

    if (this.console.lastChild.innerText !== comment) { this.console.append(this.message) }

  }

}