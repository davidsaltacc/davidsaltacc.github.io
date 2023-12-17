
var integersToPack = [];
var totalBitsAmount = 0;

var maxBitsDecrease = 0;

function toBinary(int) {
    return int.toString(2);
}

function toInt(binary) {
    return parseInt(binary, 2);
}

var packFunctionL = null;

function disableAddButton() {
    var addIntButton = document.getElementById("addint");
    addIntButton.setAttribute("disabled", "disabled");
    addIntButton.innerHTML = "Maximum Capacity Reached";
}

function enableAddButton() {
    var addIntButton = document.getElementById("addint");
    if (addIntButton.getAttribute("disabled")) {
        addIntButton.removeAttribute("disabled");
        addIntButton.innerHTML = "Add Integer";
    }
}

function intTypeChanged() {
    var value = document.getElementById("inttype").value == "int32" ? 32 : 64;
    if (totalBitsAmount == 32 - maxBitsDecrease && value == 64) {
        enableAddButton();
    } else if (totalBitsAmount == 64 - maxBitsDecrease && value == 32) {
        while (totalBitsAmount > value) {
            console.log(totalBitsAmount);
            var children = document.getElementById("intstopack").children;
            removeIntegerToPack(children[children.length - 1].children[0]);
        }
    }
}

function addIntegerToPack() {
    document.getElementById("toolarge").style.display = "none";
    var maxBits = (document.getElementById("inttype").value == "int32" ? 32 : 64) - maxBitsDecrease;
    var maxVal = parseInt(document.getElementById("maxval").value);
    var binary = toBinary(maxVal);
    var binaryLen = binary.length;
    if (totalBitsAmount + binaryLen == maxBits) {
        disableAddButton();
    } else if (totalBitsAmount + binaryLen > maxBits) {
        document.getElementById("toolarge").style.display = "block";
        return;
    }
    totalBitsAmount += binaryLen;
    var maxPossible = toInt(binary.replaceAll("0", "1"));
    var element = document.createElement("p");
    element.className = "inttopack";
    element.innerHTML = "Max Value Specified: " + maxVal + ", Max Value Possible: " + maxPossible + ", Occupies " + binaryLen + " Bits &ensp;<button class=\"removebutton\" type=\"button\" onclick=\"removeIntegerToPack(this);\">Remove</button></p>";
    document.getElementById("intstopack").appendChild(element);
    integersToPack.push({
        len: binaryLen,
        elm: element,
        max: maxVal
    });
    document.getElementById("totalbits").innerHTML = totalBitsAmount;
    packFunctionL();
}

function removeIntegerToPack(button) {
    var toRemove = null;
    integersToPack.forEach((int) => {
        if (int.elm == button.parentElement) {
            totalBitsAmount -= int.len;
            toRemove = int;
        }
    });
    if (toRemove) {
        integersToPack.splice(integersToPack.indexOf(toRemove), 1);
    } else {
        // what
    }
    enableAddButton();
    button.parentElement.remove();
    document.getElementById("totalbits").innerHTML = totalBitsAmount;
    packFunctionL();
}

function testFunctions(packFunction, unpackFunction) {

    var packIntegers = null;
    var unpackIntegers = null; // both just so vscode shuts

    eval(packFunction);
    eval(unpackFunction);

    var inputs = [];

    integersToPack.forEach((int) => {
        inputs.push(int.max);
    });
    
    var packed = packIntegers(...inputs);
    var unpacked = unpackIntegers(packed);

    var difference = [];

    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i] != unpacked[i]) {
            difference.push(i);
        }
    }

    document.getElementById("testedinput").innerHTML = inputs.length == 0 ? "<i>empty</i>" : inputs.join(", ");
    document.getElementById("testedpacked").innerHTML = !packed ? "<i>empty</i>" : packed;
    document.getElementById("testedunpacked").innerHTML = unpacked.length == 0 ? "<i>empty</i>" : unpacked.join(", ");
    document.getElementById("testedamountsuccess").innerHTML = inputs.length - difference.length;
    document.getElementById("testedamounttotal").innerHTML = inputs.length;
    document.getElementById("testedhelp").style.display = difference.length == 0 ? "none" : "block";
}

function packIntegersJs(testOnly) { // what in the name of the holy goose have i done
    var packAndUnpackFunction = "";
    var packFunction = "";
    var args = "";
    packFunction += "function packIntegers("; 
    packAndUnpackFunction += "function packAndUnpack(";
    for (var i = 0; i < integersToPack.length; i++) {
        args += "i" + i + (i == integersToPack.length - 1 ? "" : ", ");
    }
    packFunction += args;
    packAndUnpackFunction += args;
    packFunction += ") {\n    return";
    packAndUnpackFunction += ") { // for testing\n    return unpackIntegers(packIntegers(" + args + "));";
    packAndUnpackFunction += "\n}"
    var shiftAmount = 0;
    var returnLine = "";
    var shiftAmounts = []; // for use in unpack function
    for (var i = integersToPack.length - 1; i >= 0; i--) {
        var isFirst = i == integersToPack.length - 1;
        returnLine = (isFirst ? "" : "(") + "i" + i + (isFirst ? "" : (" << " + shiftAmount)) + (isFirst ? "" : ") | ") + returnLine;
        var shiftBy = integersToPack[i].len;
        shiftAmounts.push({ amt: shiftAmount, len: shiftBy });
        shiftAmount += shiftBy;
    }
    packFunction += returnLine == "" ? ";" : (" (" + returnLine + ") >>> 0;");
    packFunction += "\n}";

    var unpackFunction = "";
    unpackFunction += "function unpackIntegers(packed) {\n";
    shiftAmounts.forEach((shift) => {
        var index = shiftAmounts.indexOf(shift);
        unpackFunction += "    var i" + index + " = ";
        var isLast = index == shiftAmounts.length - 1;
        unpackFunction += (isLast ? "" : "(") + "packed ";
        var index2 = shiftAmounts.length - index - 1;
        unpackFunction += isLast ? "" : (">>> " + shiftAmounts[index2].amt + ") ");
        unpackFunction += "& 0b" + "1".repeat(shiftAmounts[index2].len) + ";\n";
    });
    unpackFunction += "    return [";
    for (var i = 0; i < integersToPack.length; i++) {
        unpackFunction += "i" + i + (i == integersToPack.length - 1 ? "" : ", ");
    }
    unpackFunction += "];\n"
    unpackFunction += "}";

    testFunctions(packFunction, unpackFunction);
    if (testOnly) {
        return;
    }

    document.getElementById("codecontainer").className = "language-javascript";
    document.getElementById("packcode").children[0].innerHTML = "// javascript\n\n" + packFunction + "\n\n" + unpackFunction + "\n\n\n\n" + packAndUnpackFunction;
    hljs.highlightAll();
}

function packIntegersPy() { // python
    var packAndUnpackFunction = "";
    var packFunction = "";
    var args = "";
    packFunction += "def packIntegers("; 
    packAndUnpackFunction += "def packAndUnpack(";
    for (var i = 0; i < integersToPack.length; i++) {
        args += "i" + i + (i == integersToPack.length - 1 ? "" : ", ");
    }
    packFunction += args;
    packAndUnpackFunction += args;
    packFunction += "):\n    return";
    packAndUnpackFunction += "): # for testing\n    return unpackIntegers(packIntegers(" + args + "))";
    packAndUnpackFunction += "\n"
    var shiftAmount = 0;
    var returnLine = "";
    var shiftAmounts = []; // for use in unpack function
    for (var i = integersToPack.length - 1; i >= 0; i--) {
        var isFirst = i == integersToPack.length - 1;
        returnLine = (isFirst ? "" : "(") + "i" + i + (isFirst ? "" : (" << " + shiftAmount)) + (isFirst ? "" : ") | ") + returnLine;
        var shiftBy = integersToPack[i].len;
        shiftAmounts.push({ amt: shiftAmount, len: shiftBy });
        shiftAmount += shiftBy;
    }
    packFunction += returnLine == "" ? "" : (" (" + returnLine + ") + 2 ** 32");
    packFunction += "\n";

    var unpackFunction = "";
    unpackFunction += "def unpackIntegers(packed):\n";
    shiftAmounts.forEach((shift) => {
        var index = shiftAmounts.indexOf(shift);
        unpackFunction += "    i" + index + " = ";
        var isLast = index == shiftAmounts.length - 1;
        unpackFunction += (isLast ? "" : "(") + "packed ";
        var index2 = shiftAmounts.length - index - 1;
        unpackFunction += isLast ? "" : (">> " + shiftAmounts[index2].amt + ") ");
        unpackFunction += "& 0b" + "1".repeat(shiftAmounts[index2].len) + "\n";
    });
    unpackFunction += "    return [";
    for (var i = 0; i < integersToPack.length; i++) {
        unpackFunction += "i" + i + (i == integersToPack.length - 1 ? "" : ", ");
    }
    unpackFunction += "]";

    packIntegersJs(true);

    document.getElementById("codecontainer").className = "language-python";
    document.getElementById("packcode").children[0].innerHTML = "# python\n\n" + packFunction + "\n\n" + unpackFunction + "\n\n\n\n" + packAndUnpackFunction;
    hljs.highlightAll();
}

packFunctionL = packIntegersJs;