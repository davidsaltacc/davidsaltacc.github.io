
function el(e) {
    return document.getElementById(e);
}

function randomQuestion() {
    fetch("../../assets/text/pages/iWasBored/cardsagainsthumanity/questions.txt")
    .then(response => response.text())
    .then(data => {
        var dataSplit = data.split("\n");
        el("question").innerHTML = dataSplit[Math.floor(Math.random() * dataSplit.length)];
    });
}

function randomAnswers() {
    fetch("../../assets/text/pages/iWasBored/cardsagainsthumanity/answers.txt")
    .then(response => response.text())
    .then(data => {
        var dataSplit = data.split("\n");
        var ans1 = dataSplit[Math.floor(Math.random() * dataSplit.length)];
        var ans2 = dataSplit[Math.floor(Math.random() * dataSplit.length)];
        var ans3 = dataSplit[Math.floor(Math.random() * dataSplit.length)];
        var ans4 = dataSplit[Math.floor(Math.random() * dataSplit.length)];
        var ans5 = dataSplit[Math.floor(Math.random() * dataSplit.length)];
        var cards = document.getElementsByClassName("card");
        cards[0].innerHTML = ans1;
        cards[1].innerHTML = ans2;
        cards[2].innerHTML = ans3;
        cards[3].innerHTML = ans4;
        cards[4].innerHTML = ans5;
    });
}

function answered(ques, card) {
    randomQuestion();
    randomAnswers();
    console.log(ques + card.replace("\n", ""));
}

var cards = document.getElementsByClassName("card");
cards[0].addEventListener("click", (e) => {answered(el("question").innerHTML, cards[0].innerHTML)}); // TODO detect if multiple answers are required, then add the possibility to select more
cards[1].addEventListener("click", (e) => {answered(el("question").innerHTML, cards[1].innerHTML)});
cards[2].addEventListener("click", (e) => {answered(el("question").innerHTML, cards[2].innerHTML)});
cards[3].addEventListener("click", (e) => {answered(el("question").innerHTML, cards[3].innerHTML)});
cards[4].addEventListener("click", (e) => {answered(el("question").innerHTML, cards[4].innerHTML)});

randomQuestion();
randomAnswers();