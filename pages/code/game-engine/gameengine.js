/* Small Game Engine Code made by David, https://youtube.com/@justacoder_ */

class GameManager {
    constructor() {
        this.Background_SetImage = function (img) {
            document.body.setAttribute("style", "background: url(" + img + "); width: 100%; height: 100%; background-repeat: no-repeat; background-size: cover;");
        };
        this.Background_SetColorRGB = function (r, g, b) {
            document.body.setAttribute("style", "background: rgb(" + r + ", " + g + ", " + b + "); width: 100%; height: 100%; background-repeat: no-repeat; background-size: cover;");
        };
        this.Background_SetColorHEX = function (hex) {
            document.body.setAttribute("style", "background: " + hex + "; width: 100%; height: 100%; background-repeat: no-repeat; background-size: cover;");
        };
        this.Background_SetRandomColor = function () {
            this.Background_SetColorHEX("#" + Math.floor(Math.random() * 16777215).toString(16));
        };
    }
}
class Sprite {
    constructor(pic0, picSizeX0, picSizeY0, spawnX0, spawnY0, name0, id0, rotation0) {
        this.HTMLElement = document.createElement("div");
        this.StyleSheet = document.createElement("style");
        this.Hovered = function () {};
        this.HoveredEnd = function () {};
        this.KeyDown = function () {};
        this.KeyUp = function () {};
        this.Clicked = function () {};
        this.XPos = 0;
        this.YPos = 0;
        this.Rotation = 0;
        this.Name = "";
        this.Id = "";
        this.Pic = "";
        this.PicSizeX = 0;
        this.PicSizeY = 0;
        this.Create = function (pic, picSizeX, picSizeY, spawnX, spawnY, name, id, rotation) {
            this.HTMLElement.setAttribute("style", "position: absolute; background: url(" + pic + "); width: " + picSizeX + "px; height: " + picSizeY + "px; background-repeat: no-repeat; background-size: 100% 100%; left: " + spawnX + "px; top: " + spawnY + "px; transform: rotate(" + rotation + "deg);");
            this.HTMLElement.setAttribute("id", id);
            this.XPos = spawnX;
            this.YPos = spawnY;
            this.Rotation = rotation;
            this.Name = name;
            this.Id = id;
            this.Pic = pic;
            this.PicSizeX = picSizeX;
            this.PicSizeY = picSizeY;
            document.body.appendChild(this.HTMLElement);
            return this;
        };
        this.SetAbsPosition = function (x, y) {
            this.HTMLElement.style.left = x + "px";
            this.HTMLElement.style.top = y + "px";
            this.XPos = x;
            this.YPos = y;
        };
        this.Move = function (x, y) {
            this.HTMLElement.style.left = (x + parseInt(this.HTMLElement.style.left.replace("px", ""))) + "px";
            this.HTMLElement.style.top = (y + parseInt(this.HTMLElement.style.top.replace("px", ""))) + "px";
            this.XPos = this.HTMLElement.style.left;
            this.YPos = this.HTMLElement.style.top;
        };
        this.SmoothMove = function (x, y, time, easing) {
            var element = this.HTMLElement;
            var style = this.StyleSheet;
            var spritecss = "animation-name: " + this.Id + "movekeyframes; animation-duration: " + time + "s; transition-timing-function:  " + easing + "; animation-delay: 0s; animation-iteration-count: 1; animation-fill-mode: forwards;";
            var animcss = `
        @keyframes ` + this.Id + `movekeyframes {
            0% {
                left: ` + this.XPos + `px;
                top: ` + this.YPos + `px;
            }
            100% {
                left: ` + (x + this.XPos) + `px;
                top: ` + (y + this.YPos) + `px;
            }
        }
        `;
            style.innerHTML += animcss;
            element.setAttribute("style", element.getAttribute("style") + spritecss);
            element.addEventListener('animationend', function () {
                style.innerHTML = style.innerHTML.replace(animcss, "");
                element.setAttribute("style", element.getAttribute("style").replace(spritecss, ""));
            });
            element.style.left = (x + this.XPos) + "px";
            element.style.top = (y + this.YPos) + "px";
            this.XPos = (x + this.XPos);
            this.YPos = (y + this.YPos);
            this.HTMLElement = element;
        };
        this.SetAbsRotation = function (deg) {
            this.HTMLElement.style.transform = "rotate(" + deg + "deg)";
            this.Rotation = deg;
        };
        this.Rotate = function (deg) {
            var element = this.HTMLElement;
            var spritecss = "transform: rotate(" + (parseInt(this.HTMLElement.style.transform.replace("rotate(", "").replace("deg);", "")) + deg) + "deg);";
            element.setAttribute("style", element.getAttribute("style").replace("transform: rotate(" + parseInt(this.HTMLElement.style.transform.replace("rotate(", "").replace("deg);", "")) + "deg);", spritecss));
            this.HTMLElement = element;
            this.Rotation = parseInt(this.HTMLElement.style.transform.replace("rotate(", "").replace("deg);", ""));
            if (parseInt(this.HTMLElement.style.transform.replace("rotate(", "").replace("deg);", "")) >= 360) {
                var spritecss0 = "transform: rotate(" + (parseInt(this.HTMLElement.style.transform.replace("rotate(", "").replace("deg);", "")) - 360) + "deg);";
                element.setAttribute("style", element.getAttribute("style").replace("transform: rotate(" + parseInt(this.HTMLElement.style.transform.replace("rotate(", "").replace("deg);", "")) + "deg);", spritecss0));
                this.Rotation = parseInt(this.HTMLElement.style.transform.replace("rotate(", "").replace("deg);", ""));
            }
        };
        this.SmoothRotate = function (deg, time, easing) {
            var element = this.HTMLElement;
            var style = this.StyleSheet;
            var animcss = `
        @keyframes ` + this.Id + `rotkeyframes {
            0% {
                transform: rotate(` + parseInt(element.style.transform.replace("rotate(", "").replace("deg);", "")) + `deg);
            }
            100% {
                transform: rotate(` + (parseInt(element.style.transform.replace("rotate(", "").replace("deg);", "")) + deg) + `deg);
            }
        }
        #` + this.Id + ` {
            animation-name: ` + this.Id + `rotkeyframes;
            animation-duration: ` + time + `s;
            transition-timing-function:  ` + easing + `;
            animation-delay: 0s;
            animation-iteration-count: 1;
            animation-fill-mode: forwards;
        }
        `;
            style.innerHTML += animcss;
            element.addEventListener('animationend', function animend() {
                style.innerHTML = style.innerHTML.replace(animcss, "");
                element.style.transform = "rotate(" + (parseInt(element.style.transform.replace("rotate(", "").replace("deg);", "")) + deg) + "deg)";
                this.Rotation = parseInt(element.style.transform.replace("rotate(", "").replace("deg);", ""));
                if (this.Rotation >= 360) {
                    var spritecss0 = "transform: rotate(" + (this.Rotation - 360) + "deg);";
                    element.setAttribute("style", element.getAttribute("style").replace("transform: rotate(" + parseInt(element.style.transform.replace("rotate(", "").replace("deg);", "")) + "deg);", spritecss0));
                    this.Rotation -= 360;
                } else if (this.Rotation < 0) {
                    var spritecss0 = "transform: rotate(" + (360 - Math.abs(this.Rotation)) + "deg);";
                    element.setAttribute("style", element.getAttribute("style").replace("transform: rotate(" + parseInt(element.style.transform.replace("rotate(", "").replace("deg);", "")) + "deg);", spritecss0));
                    this.Rotation -= 360;
                }
                element.removeEventListener("animationend", animend);
            });
            this.HTMLElement = element;
        };
        this.Clone = function (id) {
            return new Sprite(this.Pic, this.PicSizeX, this.PicSizeY, this.XPos, this.YPos, this.Name, id, this.Rotation);
        };
        this.SetSize = function (x, y) {
            this.HTMLElement.style.width = x + "px";
            this.HTMLElement.style.height = y + "px";
            this.PicSizeX = x;
            this.PicSizeY = y;
        };
        this.SetOnClickEvent = function (f) {
            this.Clicked = f;
            this.HTMLElement.addEventListener("click", this.Clicked);
        };
        this.RemoveOnClickEvent = function () {
            this.HTMLElement.removeEventListener("click", this.Clicked);
            this.Clicked = function () {};
        };
        this.SetOnHoverEvent = function (f) {
            this.Hovered = f;
            this.HTMLElement.addEventListener("mouseover", this.Hovered);
        };
        this.RemoveOnHoverEvent = function () {
            this.HTMLElement.removeEventListener("mouseover", this.Hovered);
            this.Hovered = function () {};
        };
        this.SetOnHoverEndEvent = function (f) {
            this.HoveredEnd = f;
            this.HTMLElement.addEventListener("mouseout", this.HoveredEnd);
        };
        this.RemoveOnHoverEndEvent = function () {
            this.HTMLElement.removeEventListener("mouseout", this.HoveredEnd);
            this.HoveredEnd = function () {};
        };
        this.SetOnKeyDownEvent = function (f) {
            this.KeyDown = f;
            document.addEventListener("keydown", this.KeyDown);
        };
        this.RemoveOnKeyDownEvent = function () {
            document.removeEventListener("keydown", this.KeyDown);
            this.KeyDown = function () {};
        };
        this.SetOnKeyUpEvent = function (f) {
            this.KeyUp = f;
            document.addEventListener("keyup", this.KeyUp);
        };
        this.RemoveOnKeyUpEvent = function () {
            document.removeEventListener("keyup", this.KeyUp);
            this.KeyUp = function () {};
        };
        document.head.appendChild(this.StyleSheet);
        this.Create(pic0, picSizeX0, picSizeY0, spawnX0, spawnY0, name0, id0, rotation0);
    }
}
class ParticleArea {
    constructor(minX0, maxX0, minY0, maxY0) {
        this.minX = 0;
        this.maxX = 0;
        this.minY = 0;
        this.maxY = 0;
        this.Create = function (minX, maxX, minY, maxY) {
            this.minX = minX;
            this.maxX = maxX;
            this.minY = minY;
            this.maxY = maxY;
            return this;
        };
        this.Create(minX0, maxX0, minY0, maxY0);
    }
}
class ParticleEmitter {
    constructor(spawnarea0, endarea0, time0, amountpersec0, pics0, picSizeX0, picSizeY0, particleid0, maxrotation0, maxrotationovertime0, easing0, minzlayer0, maxzlayer0) {
        this.Create = function (spawnarea, endarea, time, amountpersec, pics, picSizeX, picSizeY, particleid, maxrotation, maxrotationovertime, easing, minzlayer, maxzlayer) {
            var particlei = 0;
            var particlename = particleid + particlei;
            var style = document.createElement("style");
            style.id = "particlecss_" + particleid
            document.head.appendChild(style)
            setInterval(function () {
                if (true) {
                    var spawnX = Math.floor(Math.random() * (Math.floor(spawnarea.maxX) - Math.ceil(spawnarea.minX))) + Math.ceil(spawnarea.minX);
                    var spawnY = Math.floor(Math.random() * (Math.floor(spawnarea.maxY) - Math.ceil(spawnarea.minY))) + Math.ceil(spawnarea.minY);
                    var endX = Math.floor(Math.random() * (Math.floor(endarea.maxX) - Math.ceil(endarea.minX))) + Math.ceil(endarea.minX);
                    var endY = Math.floor(Math.random() * (Math.floor(endarea.maxY) - Math.ceil(endarea.minY))) + Math.ceil(endarea.minY);
                    var particle = document.createElement("div");
                    particle.className = "particle";
                    particle.id = "particle" + particlename;
                    particle.style.position = "fixed";
                    particle.style.left = spawnX + "px";
                    particle.style.top = spawnY + "px";
                    particle.style.width = picSizeX + "px";
                    particle.style.height = picSizeY + "px";
                    particle.style.background = "url(" + pics[Math.floor(Math.random() * pics.length)] + ")";
                    particle.style.backgroundRepeat = "no-repeat";
                    particle.style.backgroundSize = "100% 100%";
                    particle.style.zIndex = Math.floor(Math.random() * (Math.floor(maxzlayer) - Math.ceil(minzlayer))) + Math.ceil(minzlayer);
                    particle.addEventListener('animationend', function () {
                        style.innerHTML = style.innerHTML.replace(animcss, "");
                        particle.remove();
                    });
                    document.body.appendChild(particle);
                    var rotation = Math.floor(Math.random() * (Math.floor(maxrotation)));
                    var rotationovertime = Math.floor(Math.random() * (Math.floor(maxrotationovertime))) + rotation;
                    var animcss = `
                @keyframes ` + particlename + `keyframes {
                    0% {
                        left: ` + spawnX + `px;
                        top: ` + spawnY + `px;
                        transform: rotate(` + rotation + `deg);
                    }
                    100% {
                        left: ` + endX + `px;
                        top: ` + endY + `px;
                        transform: rotate(` + rotationovertime + `deg);
                    }
                }
                #` + particle.id + ` {
                    animation-name: ` + particlename + `keyframes;
                    animation-duration: ` + time + `s;
                    transition-timing-function:  ` + easing + `;
                    animation-delay: 0s;
                    animation-iteration-count: 1;
                    animation-fill-mode: forwards;
                }
                `;
                    style.innerHTML += animcss;
                    particlei += 1;
                    particlename = particleid + particlei;
                }
            }, 1000 / amountpersec);
            return this;
        };
        this.Create(spawnarea0, endarea0, time0, amountpersec0, pics0, picSizeX0, picSizeY0, particleid0, maxrotation0, maxrotationovertime0, easing0, minzlayer0, maxzlayer0);
    }
}
