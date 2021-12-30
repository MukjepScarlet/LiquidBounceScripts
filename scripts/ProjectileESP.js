/**
 * updated from FireballTracker
 */
script = registerScript({
    name: "ProjectileESP",
    authors: ["MyScarlet"],
    version: "2.0"
});

script.import("Core.lib");
script.import("utils/RenderUtils.js");

var hitBlockPosWithColor = new java.util.HashMap(); //<BlcokPos, Color>
var hitEntityWithColor = new java.util.HashMap(); //<EntityLivingBase, Color>

var TeamsModule = LiquidBounce.moduleManager.getModule("Teams");

module = {
    name: "ProjectileESP",
    escription: "Draw the route of fireballs & arrows.",
    category: "Render",
    values: [
        entityHitBoxExpansion = value.createFloat("EntityHitBoxExpansion", 0.25, 0.0, 0.5),
        maxLength = value.createInteger("MaxLength", 16, 1024),
        lineWidth = value.createFloat("LineWidth", 2.0, 0.5, 5.0),
        fireball = value.createBoolean("Fireball", true),
        arrow = value.createBoolean("Arrow", true)
    ],
    onRender3D: function() {
        var size = entityHitBoxExpansion.get();
        var length = maxLength.get();
        var renderPos = new Vec3(mc.getRenderManager().renderPosX, mc.getRenderManager().renderPosY, mc.getRenderManager().renderPosZ);

        hitBlockPosWithColor.clear();
        hitEntityWithColor.clear();

        GL11.glPushMatrix();

        GL11.glBlendFunc(770, 771);
        GL11.glEnable(3042);
        GL11.glDisable(3553);
        GL11.glDisable(3008);
        GL11.glDisable(2929);
        GL11.glDepthMask(false);

        GL11.glEnable(2848);
        GL11.glHint(3154, 4354);

        GL11.glLineWidth(lineWidth.get());

        for each(var entity in mc.theWorld.loadedEntityList) {
            if (fireball.get() && entity instanceof EntityFireball) {
                //direction vector
                var acceleration = new Vec3(entity.accelerationX, entity.accelerationY, entity.accelerationZ).normalize();

                if (acceleration.lengthVector() === 0) continue;

                var fireballColor = new Color(255, 0, 0);

                var position = entity.getPositionVector(),
                    cur = position.add(acceleration);

                var blockCollision = null,
                    entityCollision = null;

                var putTarget = false;

                for (; !blockCollision && cur.distanceTo(position) < length; cur = cur.add(acceleration)) {
                    blockCollision = mc.theWorld.rayTraceBlocks(position, cur, false, true, false);
                    //set fireball box
                    var fireballBox = new AxisAlignedBB(cur.xCoord - size, cur.yCoord - size, cur.zCoord - size, cur.xCoord + size,
                        cur.yCoord + size, cur.zCoord + size).addCoord(acceleration.xCoord, acceleration.yCoord, acceleration.zCoord).expand(1.0, 1.0, 1.0);

                    var chunkMinX = MathHelper.floor_double((fireballBox.minX - 2.0) / 16.0);
                    var chunkMaxX = MathHelper.floor_double((fireballBox.maxX + 2.0) / 16.0);
                    var chunkMinZ = MathHelper.floor_double((fireballBox.minZ - 2.0) / 16.0);
                    var chunkMaxZ = MathHelper.floor_double((fireballBox.maxZ + 2.0) / 16.0);

                    //check entities in the line
                    for (var x = chunkMinX; x <= chunkMaxX; x++)
                        for (var z = chunkMinZ; z <= chunkMaxZ; z++)
                            for each(var entities in mc.theWorld.getChunkFromChunkCoords(x, z).getEntityLists()) {
                                for each(var it in entities) {
                                    var entityBox = it.getEntityBoundingBox().expand(size, size, size);
                                    if (it === entity || !entityBox.intersectsWith(fireballBox)) continue;
                                    entityCollision = entityBox.calculateIntercept(position, cur);
                                    if (entityCollision) {
                                        blockCollision = entityCollision;
                                        hitEntityWithColor.put(it, fireballColor);
                                        putTarget = true;
                                    }
                                }
                            }
                }

                var hitVec;
                if (blockCollision) {
                    putTarget || hitBlockPosWithColor.put(blockCollision.getBlockPos(), fireballColor);
                    hitVec = blockCollision.hitVec;
                } else hitVec = cur;

                GL11.glBegin(1);

                RenderUtils.glColor(fireballColor);

                GL11.glVertex3d(hitVec.xCoord - renderPos.xCoord, hitVec.yCoord - renderPos.yCoord, hitVec.zCoord - renderPos.zCoord);
                GL11.glVertex3d(position.xCoord - renderPos.xCoord, position.yCoord - renderPos.yCoord, position.zCoord - renderPos.zCoord);

                GL11.glEnd();
            }

            if (arrow.get() && entity instanceof EntityArrow && !getField(entity, "field_70254_i" /*private boolean inGround */ ).get(entity)) {
                //motion
                var acceleration = new Vec3(entity.motionX, entity.motionY, entity.motionZ);

                var arrowColor = entity.shootingEntity && TeamsModule.isInYourTeam(entity.shootingEntity) ? new Color(0, 255, 0) : new Color(255, 0, 0);

                var position = new Vec3(entity.posX, entity.posY, entity.posZ),
                    cur = position.add(acceleration),
                    lastCur = position;

                var blockCollision = null,
                    entityCollision = null;

                GL11.glBegin(3);
                RenderUtils.glColor(arrowColor);

                var putTarget = false;

                for (var lengthSum = 0; !blockCollision && lengthSum < length; cur = cur.add(acceleration)) {
                    blockCollision = mc.theWorld.rayTraceBlocks(lastCur, cur, false, true, false);
                    //set arrow box
                    var arrowBox = new AxisAlignedBB(cur.xCoord - size, cur.yCoord - size, cur.zCoord - size, cur.xCoord + size,
                        cur.yCoord + size, cur.zCoord + size).addCoord(acceleration.xCoord, acceleration.yCoord, acceleration.zCoord).expand(1.0, 1.0, 1.0);

                    var chunkMinX = MathHelper.floor_double((arrowBox.minX - 2.0) / 16.0);
                    var chunkMaxX = MathHelper.floor_double((arrowBox.maxX + 2.0) / 16.0);
                    var chunkMinZ = MathHelper.floor_double((arrowBox.minZ - 2.0) / 16.0);
                    var chunkMaxZ = MathHelper.floor_double((arrowBox.maxZ + 2.0) / 16.0);

                    //check entities in the route(parabola)
                    for (var x = chunkMinX; x <= chunkMaxX; x++)
                        for (var z = chunkMinZ; z <= chunkMaxZ; z++)
                            for each(var entities in mc.theWorld.getChunkFromChunkCoords(x, z).getEntityLists()) {
                                for each(var it in entities) {
                                    var entityBox = it.getEntityBoundingBox().expand(size, size, size);
                                    if (it === entity || !entityBox.intersectsWith(arrowBox)) continue;
                                    entityCollision = entityBox.calculateIntercept(lastCur, cur);
                                    if (entityCollision) {
                                        blockCollision = entityCollision;
                                        hitEntityWithColor.put(it, arrowColor);
                                        putTarget = true;
                                    }
                                }
                            }

                    var scalar = BlockUtils.getMaterial(new BlockPos(cur)) === Material.water ? 0.6 : 0.99;
                    acceleration = new Vec3(acceleration.xCoord * scalar, acceleration.yCoord * scalar, acceleration.zCoord * scalar)
                        .subtract(0, 0.05000000074505806, 0);

                    GL11.glVertex3d(cur.xCoord - renderPos.xCoord, cur.yCoord - renderPos.yCoord, cur.zCoord - renderPos.zCoord);

                    lengthSum += lastCur.distanceTo(cur);
                    lastCur = cur;
                }
                GL11.glEnd();

                blockCollision && !putTarget && hitBlockPosWithColor.put(blockCollision.getBlockPos(), arrowColor);
            }
        }

        GL11.glEnable(3553);
        GL11.glDisable(2848);
        GL11.glEnable(3008);
        GL11.glEnable(2929);
        GL11.glDepthMask(true);
        GL11.glDisable(3042);
        GL11.glColor4f(1, 1, 1, 1);

        GL11.glPopMatrix();

        hitBlockPosWithColor.forEach(function(pos, color) RenderUtils.drawBlockBox(pos, color, false));
        hitEntityWithColor.forEach(function(ent, color) RenderUtils.drawEntityBox(ent, color, false));
    }
}
