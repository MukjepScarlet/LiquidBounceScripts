script = registerScript({
    name: "PointerESP",
    authors: ["AquaVit", "MyScarlet"],
    version: "2.0"
});

script.import("Core.lib");
script.import("utils/RenderUtils.js");

var TeamsModule = LiquidBounce.moduleManager.getModule("Teams");

/**
 * @param {number} cx center X pos
 * @param {number} cy center Y pos
 * @param {number} r 
 * @param {number} n number of frame lines
 * @param {number} color rgba color
 */
function drawArrow(cx, cy, r, n, color) {
    GlStateManager.pushMatrix();

    var rad = 2 * Math.PI / n;
    enableGL2D();
    GlStateManager.scale(0.5, 0.5, 0.5); //???
    GlStateManager.color(0, 0, 0);
    GlStateManager.resetColor();
    glColor(color);
    GL11.glBegin(2); //GL_LINE_LOOP
    for (var i = 0, x = 2 * r, y = 0; i < n; i++) {
        GL11.glVertex2f(x + cx, y + cy);
        var _xy = rotate([x, y], rad);
        x = _xy[0], y = _xy[1];
    }
    GL11.glEnd();
    GlStateManager.scale(2.0, 2.0, 2.0);
    disableGL2D();
    GlStateManager.color(1, 1, 1, 1);

    GlStateManager.popMatrix();
}

module = {
    name: "PointerESP",
    category: "Render",
    values: [
        mode = value.createList("Mode", ["Solid", "Line"], "Solid"),
        posX = value.createFloat("PosX", 0.0, -0.5, 0.5),
        posY = value.createFloat("PosY", 0.0, -0.5, 0.5),
        radius = value.createFloat("Radius", 25.0, 10.0, 100.0),
        scale = value.createFloat("Scale", 1.0, 0.5, 3.0),
        colorMode = value.createList("ColorMode", ["Custom", "Distance", "Team"], "Custom"),
        red = value.createInteger("Red", 5, 0, 255),
        green = value.createInteger("Green", 5, 0, 255),
        blue = value.createInteger("Blue", 5, 0, 255),
        alpha = value.createInteger("Alpha", 5, 0, 255)
    ],
    onRender2D: function() {
        var sr = new ScaledResolution(mc);
        var xCenter = sr.getScaledWidth_double() * (0.5 + posX.get());
        var yCenter = sr.getScaledHeight_double() * (0.5 + posY.get());

        Java.from(mc.theWorld.loadedEntityList)
            .filter(function(entity) EntityUtils.isSelected(entity, true) || entity instanceof EntityPlayer && TeamsModule.isInYourTeam(entity))
            .sort(function(b, a) mc.thePlayer.getDistanceToEntity(a) - mc.thePlayer.getDistanceToEntity(b)) //Distance falling order
            .forEach(function(entity) {
                var loaddist = 0.2;

                var pZ = ((entity.posZ + (entity.posZ - entity.lastTickPosZ) * mc.timer.renderPartialTicks) - mc.thePlayer.posZ) * loaddist,
                    pX = ((entity.posX + (entity.posX - entity.lastTickPosX) * mc.timer.renderPartialTicks) - mc.thePlayer.posX) * loaddist;

                var rotYX = rotate([pZ, pX], Math.toRadians(mc.thePlayer.rotationYaw));
                var rotY = rotYX[0],
                    rotX = rotYX[1];

                if (Math.sqrt(rotX * rotX + rotY * rotY) >= radius.get() - 4) return;

                var color = 0xFFFFFF | alpha.get() << 24;
                switch (colorMode.get().toLowerCase()) {
                    case "team":
                        var str = entity.getDisplayName().getFormattedText();
                        for (var i = 0; i + 1 < str.length; i++) {
                            if (str[i] == '§') {
                                var index = "0123456789abcdef".indexOf(str[i + 1]);
                                if (~index) {
                                    color = colorCode[index] | alpha.get() << 24;
                                    break;
                                }
                            }
                        }
                        break;
                    case "distance":
                        var distance = mc.thePlayer.getDistanceToEntity(entity);
                        var hue = (entity instanceof EntityPlayer && TeamsModule.isInYourTeam(entity) || distance >= 48) ? 240 : (distance < 8 ? 0 : (distance - 8) * 6);
                        color = Color.getHSBColor(hue / 360, 0.8, 0.8).getRGB() | alpha.get() << 24;
                        break;
                    default:
                        color = red.get() << 16 | green.get() << 8 | blue.get() | alpha.get() << 24;
                        break;
                }

                var angle = Math.toDegrees(Math.atan2(-rotY, -rotX));
                var x = radius.get() * Math.cos(Math.toRadians(angle)) + xCenter;
                var y = radius.get() * Math.sin(Math.toRadians(angle)) + yCenter;

                GlStateManager.pushMatrix();
                GlStateManager.translate(x, y, 0);
                GlStateManager.rotate(angle, 0, 0, 1);
                GlStateManager.scale(scale.get(), scale.get(), scale.get());
                GlStateManager.scale(1.5, 1.0, 1.0);
                switch (mode.get().toLowerCase()) {
                    case "solid":
                        for (var i = 2.2; i > 0; i -= 0.3)
                            drawArrow(0, 0, i, 3, color);
                        break;
                    case "line":
                        drawArrow(0, 0, 2.2, 3, color);
                        break;
                }
                GlStateManager.popMatrix();
            });
    }
};
