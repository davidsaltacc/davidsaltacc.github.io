function createGalleryElement(img, img_downscaled) {
    var e = document.createElement("div");
    e.className = "responsive";
    var g = document.createElement("div");
    e.appendChild(g);
    g.className = "gallery";
    var a = document.createElement("a");
    g.appendChild(a);
    a.href = img;
    a.target = "_blank";
    var i = document.createElement("img");
    a.appendChild(i);
    i.src = img_downscaled;
    document.body.appendChild(e);
}

for (var n = 0; n <= 49; n++) {
    createGalleryElement("../../assets/gallery/fractals/fractal (" + n + ").png", "../../assets/gallery/fractals/downscaled/fractal (" + n + ") downscaled.png");
}
