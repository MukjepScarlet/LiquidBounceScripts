script = registerScript({
    name: "DamageParticles",
    authors: ["MyScarlet"],
    version: "1.4"
});

script.import("Core.lib");
script.import("utils/RenderUtils.js");

var particles = new java.util.LinkedList();
var healthMap = new java.util.HashMap();

module = {
    name: "DamageParticles",
    category: "Render",
    values: [
        livingTicks = value.createInteger("LivingFPS", 90, 20, 300),
        scale = value.createFloat("Scale", 1.0, 0.5, 3.0)
    ],
    onUpdate: function() {
        for each(var entity in mc.theWorld.loadedEntityList) {
            if (entity == mc.thePlayer || !(entity instanceof EntityLivingBase)) continue;

            if (!healthMap[entity]) {
                healthMap[entity] = entity.getHealth();
                continue;
            }

            var healthVariation = entity.getHealth() - healthMap[entity]; // this tick - last tick

            if (!healthVariation) continue;

            particles.add({
                ticks: 0,
                // if health increased green (a) else red (c)
                text: "\247" + String.fromCharCode(98 - java.lang.Math.signum(healthVariation)) + (Math.round(10 * Math.abs(healthVariation)) * .1).toFixed(1),
                location: [
                    entity.posX + entity.motionX + mc.thePlayer.motionX + Math.random() * 0.5 * java.lang.Math.signum(0.5 - Math.random()),
                    (entity.getEntityBoundingBox().minY + entity.getEntityBoundingBox().maxY) * 0.35 + mc.thePlayer.motionY,
                    entity.posZ + entity.motionZ + mc.thePlayer.motionZ + Math.random() * 0.5 * java.lang.Math.signum(0.5 - Math.random())
                ]
            });
            healthMap[entity] = entity.getHealth();
        }
    },
    onRender3D: function() {
        GL11.glPushMatrix();
        GL11.glScalef(scale.get(), scale.get(), scale.get());
        for (var it = particles.iterator(), p; it.hasNext() && (p = it.next()); p.ticks++) {
            drawFaceToPlayer(p.location, function() {
                mc.fontRendererObj.drawStringWithShadow(p.text, -mc.fontRendererObj.getStringWidth(p.text) * 0.5, -mc.fontRendererObj.FONT_HEIGHT + 1, 0);
            });

            p.ticks <= 30 * Math.log(livingTicks.get() * .05) && (p.location[1] += p.ticks * 0.001);
            p.ticks > livingTicks.get() && it.remove();
        }
        GL11.glPopMatrix();
    }
}
