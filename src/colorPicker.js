import gsap from "gsap"

export default class ColorPicker {

  constructor(icon, event) {

    this.colors = [
      "#797979",
      "#DB006D",
      "#ED8600",
      "#00AF66",
      "#7D02EF"
    ]

    this.icon = icon

    console.log("color picker created")

    this.drawPicker(event.pageX, event.pageY)

  }

  drawPicker(x, y) {
    
    const picker = document.createElement("div")
    picker.classList.add("color-picker")

    this.colors.forEach(color => {
      const colorElement = document.createElement("div")
      colorElement.classList.add("color")
      colorElement.style.background = color
      colorElement.addEventListener("click", () => this.setColor(color))
      picker.appendChild(colorElement)
    })

    document.querySelector("#app").appendChild(picker)
    picker.style.left = `${x}px`
    picker.style.top = `${y}px`

    // event listener to destroy the picker when clicking outside of it
    document.addEventListener("click", () => {
      gsap.to(picker, { opacity: 0, duration: 0.25, onComplete: () => picker.remove() })
    })

  }

  setColor(color) {

    this.icon.iconColor = color
    this.icon.element.style.background = color

    if (this.icon.directional && this.icon.arrowElement) {
      this.icon.arrowElement.style.background = color
      this.icon.arrowElement.querySelector(".viewport-arrowhead").style.borderLeft = `16px solid ${color}`
    }

  }
}