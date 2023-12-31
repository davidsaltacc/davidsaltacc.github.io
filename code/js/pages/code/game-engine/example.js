// sprites
var s = new Sprite("test.png", 50, 50, 0, 0, "testsprite", "testsprite", 0);
var gm = new GameManager();
s.SetSize(200, 200);
s.SetOnKeyDownEvent(function(key) {
    if (key.code == "KeyR") {
        s.SmoothRotate(360, 5, "linear");
    }
});
s.SetOnHoverEvent(function() {
    s.Move(20, 20)
});
s.SetOnHoverEndEvent(function() {
    s.Move(-20, -20)
});
s2 = s.Clone();
s2.Move(200, 200);
s2.SetOnClickEvent(function() {
    gm.Background_SetRandomColor();
});
// particles
var particle_area1 = new ParticleArea(200, 200, 0, 200);
var particle_area2 = new ParticleArea(400, 400, 0, 0);
var particle_emitter1 = new ParticleEmitter(particle_area1, particle_area2, 2, 20, ["test.png"], 20, 20, "epicparticle", 0, 360, "linear", 0, 200);