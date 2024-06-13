
var EXPLOIT_DATA_URL = "https://raw.githubusercontent.com/davidsaltacc/exploits-data/main/exploits.json";
var ISSUE_DATA_URL = "https://api.github.com/repos/rsploits/rsploits.github.io/issues";

var el = x => document.getElementById(x);

function changeTab(name, button) { // very messy but works
    el("exploits").style.display = "none";
    el("viruses").style.display = "none";
    el("bypassers").style.display = "none";
    el("adblockers").style.display = "none";
    //el("editor").style.display = "none";
    el("issues").style.display = "none";
    el(name).style.display = "flex";
    el("nav_exploits_button").className = "";
    el("nav_viruses_button").className = "";
    el("nav_bypassers_button").className = "";
    el("nav_adblockers_button").className = "";
    //el("nav_editor_button").className = "";
    el("nav_issues_button").className = "";
    button.className = "active";
}

function toggleFilterMenu() {
    var filter = el("filter");
    if (filter.style.transform == "translate(0px, -150px)") {
        filter.style.transform = "";
    } else {
        filter.style.transform = "translate(0px, -150px)";
    }
}

var activeFilters = [];

function toggleFilter(name, button) {
    if (button.className.includes(" active")) {
        button.className = button.className.replace(" active", "");
    } else {
        button.className += " active";
    }
    if (activeFilters.includes(name)) {
        activeFilters = activeFilters.filter(item => item !== name);
    } else {
        activeFilters.push(name);
    }
    var allCards = Array.from(document.querySelector("#exploits .container").children);
    for (card of allCards) {
        if (activeFilters.length == 0) {
            card.style.display = "flex";
            continue;
        }
        var visible = false;
        for (filter of activeFilters) {
            if (card.className.includes(filter)) {
                card.style.display = "flex";
                visible = true;
                break;
            }
        }
        if (!visible) {
            card.style.display = "none";
        }
    }
}

function toggleNav() {
    var sidebar = el("sidebar");
    var overlay = el("overlay");
    if (sidebar.style.left == "-100vw") {
        sidebar.style.left = "0";
        overlay.style.display = "block";
        overlay.style.backgroundColor = "#000000b0";
    } else {
        sidebar.style.left = "-100vw";
        overlay.style.display = "none";
        overlay.style.backgroundColor = "#00000000";
    }
}

el("overlay").onclick = () => {
    sidebar.style.left = "-100vw";
    overlay.style.display = "none";
    overlay.style.backgroundColor = "#00000000";
};

function createCard(data) {

    var title = data.title;
    var platforms = data.platforms;
    var pros = data.pros;
    var neutrals = data.neutrals;
    var cons = data.cons;
    var additionalText = data.additionalText;
    var buttonName = data.buttonName;
    var buttonUrl = data.buttonUrl;

    var card = document.createElement("div");
    el("exploitcontainer").appendChild(card);
    card.classList.add("card");
    for (platform of platforms) {
        card.classList.add("ex_" + platform.slice(0, 3));
    }

    var content = document.createElement("div");
    card.appendChild(content);
    content.className = "content";

    var h3 = document.createElement("h3");
    content.appendChild(h3);
    h3.innerHTML = title;

    var iconContainer = document.createElement("div");
    content.appendChild(iconContainer);
    iconContainer.className = "icon-container";
    for (platform of platforms) {
        var icon = document.createElement("div");
        iconContainer.appendChild(icon);
        icon.classList.add("icon", platform);
    }

    content.appendChild(document.createElement("hr"));

    var text = document.createElement("div");
    content.appendChild(text);
    text.classList.add("text");

    for (pro of pros) {
        var p = document.createElement("p");
        text.appendChild(p);
        p.classList.add("g");
        p.innerHTML = "- " + pro;
    }

    for (neutral of neutrals) {
        var p = document.createElement("p");
        text.appendChild(p);
        p.classList.add("n");
        p.innerHTML = "- " + neutral;
    }

    for (con of cons) {
        var p = document.createElement("p");
        text.appendChild(p);
        p.classList.add("b");
        p.innerHTML = "- " + con;
    }
    
    if (additionalText && additionalText.length > 0) {
        text.appendChild(document.createElement("br"));
        var p = document.createElement("p");
        text.appendChild(p);
        p.innerHTML = additionalText;
    }

    var button = document.createElement("button");
    text.appendChild(button);
    button.innerHTML = buttonName;
    button.onclick = () => window.open(buttonUrl);

}

function createAllCardsFromJson(data) {
    var json = JSON.parse(data);
    for (card of json) {
        createCard(card);
    }
}

function createEditableCard(data) {

    var title = data.title;
    var platforms = data.platforms;
    var pros = data.pros;
    var neutrals = data.neutrals;
    var cons = data.cons;
    var additionalText = data.additionalText;
    var buttonName = data.buttonName;
    var buttonUrl = data.buttonUrl;

    var card = document.createElement("div");
    el("editorCardContainer").appendChild(card);
    card.classList.add("card");
    for (platform of platforms) {
        card.classList.add("ex_" + platform.slice(0, 3));
    }

    var content = document.createElement("div");
    card.appendChild(content);
    content.className = "content";

    var h3 = document.createElement("h3");
    content.appendChild(h3);
    h3.innerHTML = title;

    var span = document.createElement("span"); 
    content.appendChild(span);
    span.className = "editbutton";
    span.innerHTML = "edit name";

    var iconContainer = document.createElement("div");
    content.appendChild(iconContainer);
    iconContainer.className = "icon-container";
    for (platform of platforms) {
        var icon = document.createElement("div");
        iconContainer.appendChild(icon);
        icon.classList.add("icon", platform);
    }

    span = document.createElement("span"); 
    content.appendChild(span);
    span.className = "editbutton";
    span.innerHTML = "edit platforms";

    content.appendChild(document.createElement("hr"));

    var text = document.createElement("div");
    content.appendChild(text);
    text.classList.add("text");

    for (pro of pros) {
        var p = document.createElement("p");
        text.appendChild(p);
        p.classList.add("g");
        p.innerHTML = "- " + pro;
    }

    span = document.createElement("span"); 
    text.appendChild(span);
    span.className = "editbutton";
    span.innerHTML = "edit pros";

    for (neutral of neutrals) {
        var p = document.createElement("p");
        text.appendChild(p);
        p.classList.add("n");
        p.innerHTML = "- " + neutral;
    }

    span = document.createElement("span"); 
    text.appendChild(span);
    span.className = "editbutton";
    span.innerHTML = "edit neutrals";

    for (con of cons) {
        var p = document.createElement("p");
        text.appendChild(p);
        p.classList.add("b");
        p.innerHTML = "- " + con;
    }

    span = document.createElement("span"); 
    text.appendChild(span);
    span.className = "editbutton";
    span.innerHTML = "edit cons";
    
    if (additionalText && additionalText.length > 0) {
        text.appendChild(document.createElement("br"));
        var p = document.createElement("p");
        text.appendChild(p);
        p.innerHTML = additionalText;
    }

    var button = document.createElement("button");
    text.appendChild(button);
    button.innerHTML = buttonName;
    button.onclick = () => window.open(buttonUrl);
    
    span = document.createElement("span"); 
    text.appendChild(span);
    span.className = "editbutton";
    span.innerHTML = "edit button";

}

function createAllEditableCardsFromJson(data) {
    var json = JSON.parse(data);
    for (card of json) {
        createEditableCard(card);
    }
}

function autoImportEditableCards() {
    fetch(EXPLOIT_DATA_URL).then(data => data.text()).then(createAllEditableCardsFromJson);
}

function createIssueCard(data) {

    var title = data.title;
    var text = data.body;
    var date = data.created_at;
    var author = data.user.login;
    var url = data.html_url;

    var card = document.createElement("div");
    el("issues").appendChild(card);
    card.className = "card issue";

    var content = document.createElement("div");
    card.appendChild(content);
    content.className = "content";

    var issueDate = document.createElement("div");
    content.appendChild(issueDate);
    issueDate.className = "issuedate";
    issueDate.innerHTML = "Opened on: " + new Date(date).toLocaleString();

    var issueAuthor = document.createElement("div");
    content.appendChild(issueAuthor);
    issueAuthor.className = "issueauthor";
    issueAuthor.innerHTML = "Opened by: " + author;

    var titleH2 = document.createElement("h2");
    content.appendChild(titleH2);
    titleH2.innerHTML = title;
    
    span = document.createElement("span"); 
    titleH2.appendChild(span);
    span.className = "openongithubbutton";
    span.innerHTML = "Open on github";
    span.onclick = () => window.open(url);

    content.appendChild(document.createElement("hr"));

    var textDiv = document.createElement("div");
    content.appendChild(textDiv);
    textDiv.className = "text";
    textDiv.innerHTML = text.replaceAll("\n", "<br>");

}

function createAllIssueCardsFromJson(data) {
    var json = JSON.parse(data);
    if (json.length > 0) {
        el("issuetitle").innerHTML = "There are some open issues or suggestions";
    }
    for (issue of json) {
        createIssueCard(issue);
    }
}

fetch(EXPLOIT_DATA_URL).then(data => data.text()).then(createAllCardsFromJson);
fetch(ISSUE_DATA_URL).then(data => data.text()).then(createAllIssueCardsFromJson);