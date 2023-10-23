
function parseTextToTree(text) {
    var lines = text.split("\n").map(line => ({
        depth: line.lastIndexOf('[') + 1,
        value: line.slice(line.lastIndexOf('[') + 1).trim()
    }));
    return buildTree(lines, 0, 0);
}

function buildTree(lines, depth, index) {
    var node = { name: lines[index].value, children: [] };
    index++;
    while (index < lines.length && lines[index].depth > depth) {
        var child = buildTree(lines, lines[index].depth, index);
        node.children.push(child.node);
        index = child.index;
    }
    return { node, index };
}

function createHtmlTree(node, depth = 0) {
    var html = '';
	var indent = 30;
	
	if (depth == 0) {
		indent = 0;
	}
	
    if (node.children.length > 0) {
        html += `<details style="margin-left: ${indent}px"><summary>${node.name}</summary>`;
        node.children.forEach(child => {
            html += createHtmlTree(child, depth + 1);
        });
        html += '</details>';
    } else {
        html += `<p style="margin-left: ${indent}px">&#x2022; ${node.name}</p>`;
    }

    return html;
}

function textToTree(text) {
	return createHtmlTree(parseTextToTree(text).node);
}

var treeText = document.getElementById("tree").innerHTML;
document.body.innerHTML += textToTree(treeText.substring(1).substring(0, treeText.length - 1));
