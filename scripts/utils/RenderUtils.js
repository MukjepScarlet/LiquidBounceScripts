var GL11 = Java.type("org.lwjgl.opengl.GL11");
var GlStateManager = Java.type("net.minecraft.client.renderer.GlStateManager");
var Gui = Java.type("net.minecraft.client.gui.Gui");


/**
 * @param {number[]} pos
 * @param {function} draw 
 */
function drawFaceToPlayer(pos, draw) {
    GlStateManager.pushMatrix();
    GlStateManager.enablePolygonOffset();
    GlStateManager.doPolygonOffset(1, -1500000);
    
    GlStateManager.translate(pos[0] - mc.getRenderManager().renderPosX, pos[1] - mc.getRenderManager().renderPosY, pos[2] - mc.getRenderManager().renderPosZ);
    
    GlStateManager.rotate(-mc.getRenderManager().playerViewY, 0, 1, 0);
    GlStateManager.rotate(mc.getRenderManager().playerViewX, mc.gameSettings.thirdPersonView == 2 ? -1 : 1, 0, 0);

    GlStateManager.scale(-0.03, -0.03, 0.03);
    GL11.glDepthMask(false);

    draw();

    GL11.glColor4f(1, 1, 1, 1);
    GL11.glDepthMask(true);
    GlStateManager.doPolygonOffset(1, 1500000);
    GlStateManager.disablePolygonOffset();
    GlStateManager.popMatrix();
}
