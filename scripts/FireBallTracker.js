script = registerScript({
    name: "FireBallTracker",
    authors: ["MyScarlet"],
    version: "1.0"
});

script.import("Core.lib");
script.import("utils/RenderUtils.js");

module = {
    name: "FireBallTracker",
    description: "Draw the route of fireballs.",
    category: "Render",
    values: [
        lineWidth = value.createFloat("LineWidth", 2, 0.5, 5)
    ],
    onRender3D: function() {
        GL11.glPushMatrix();

        GL11.glBlendFunc(770, 771);
        GL11.glEnable(3042);
        GL11.glEnable(2848);
        GL11.glLineWidth(lineWidth.get());
        GL11.glDisable(3553);
        GL11.glDisable(2929);
        GL11.glDepthMask(false);

        GL11.glBegin(1);

        for each (var entity in mc.theWorld.loadedEntityList) {
            if (!(entity instanceof EntityFireball)) continue;

            var acceleration = new Vec3(entity.accelerationX, entity.accelerationY, entity.accelerationZ);

            if (acceleration.lengthVector() == 0) continue;

            var position = entity.getPositionVector(),
                cur = position.add(acceleration);
            var rayTraceResult = null;

            for (; !rayTraceResult && cur.distanceTo(position) < 128; rayTraceResult = mc.theWorld.rayTraceBlocks(position, cur, false, true, false))
                cur = cur.add(acceleration);

            var hitPos = rayTraceResult ? rayTraceResult.hitVec : cur;

            var x = position.xCoord - mc.getRenderManager().renderPosX,
                y = position.yCoord - mc.getRenderManager().renderPosY,
                z = position.zCoord - mc.getRenderManager().renderPosZ;

            GL11.glColor4f(1.0, 0.0, 0.0, 1.0);

            GL11.glVertex3d(hitPos.xCoord - mc.getRenderManager().renderPosX, hitPos.yCoord - mc.getRenderManager().renderPosY, hitPos.zCoord - mc.getRenderManager().renderPosZ);
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
    }
}
