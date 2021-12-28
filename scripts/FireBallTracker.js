script = registerScript({
    name: "FireBallTracker",
    authors: ["MyScarlet"],
    version: "1.1"
});

script.import("Core.lib");
script.import("utils/RenderUtils.js");

module = {
    name: "FireBallTracker",
    description: "Draw the route of fireballs.",
    category: "Render",
    values: [
        lineWidth = value.createFloat("LineWidth", 2, 0.5, 5),
        lengthLimit = value.createFloat("LengthLimit", 256, 16, 512),
        drawHitBlock = value.createBoolean("DrawHitBlock", true)
    ],
    onRender3D: function() {
        var hitPos = [];

        GL11.glPushMatrix();

        GL11.glBlendFunc(770, 771);
        GL11.glEnable(3042);
        GL11.glEnable(2848);
        GL11.glLineWidth(lineWidth.get());
        GL11.glDisable(3553);
        GL11.glDisable(2929);
        GL11.glDepthMask(false);

        GL11.glBegin(1);

        for each(var entity in mc.theWorld.loadedEntityList) {
            if (!(entity instanceof EntityFireball)) continue;

            //direction vector
            var acceleration = new Vec3(entity.accelerationX, entity.accelerationY, entity.accelerationZ).normalize();

            if (acceleration.lengthVector() == 0) continue;

            var position = entity.getPositionVector(),
                cur = position.add(acceleration);
            var rayTraceResult = null;

            for (; !rayTraceResult && cur.distanceTo(position) < lengthLimit.get(); rayTraceResult = mc.theWorld.rayTraceBlocks(position, cur, false, true, false))
                cur = cur.add(acceleration);

            var hitVec = rayTraceResult ? rayTraceResult.hitVec : cur;

            rayTraceResult && rayTraceResult.getBlockPos() && hitPos.push(rayTraceResult.getBlockPos());

            var x = position.xCoord - mc.getRenderManager().renderPosX,
                y = position.yCoord - mc.getRenderManager().renderPosY,
                z = position.zCoord - mc.getRenderManager().renderPosZ;

            GL11.glColor4f(1.0, 0.0, 0.0, 1.0);

            GL11.glVertex3d(hitVec.xCoord - mc.getRenderManager().renderPosX, hitVec.yCoord - mc.getRenderManager().renderPosY, hitVec.zCoord - mc.getRenderManager().renderPosZ);
            GL11.glVertex3d(x, y, z);
        }

        GL11.glEnd();

        GL11.glEnable(3553);
        GL11.glDisable(2848);
        GL11.glEnable(2929);
        GL11.glDepthMask(true);
        GL11.glDisable(3042);
        GL11.glColor4f(1.0, 1.0, 1.0, 1.0);

        GL11.glPopMatrix();

        drawHitBlock.get() && hitPos.forEach(function(it) RenderUtils.drawBlockBox(it, new Color(255, 0, 0), false));
    }
}
