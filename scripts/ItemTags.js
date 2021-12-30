script = registerScript({
    name: "ItemTags",
    authors: ["MyScarlet"],
    version: "1.1"
});

script.import("Core.lib");
script.import("utils/RenderUtils.js");

module = {
    name: "ItemTags",
    category: "Render",
    description: "Show NameTag for EntityItem.",
    onRender3D: function() {
        for each(var entity in mc.theWorld.loadedEntityList) {
            var str;
            if (entity instanceof EntityItem) {
                var stack = entity.getEntityItem();
                str = java.lang.String.format("%s *%d", stack.getDisplayName(), stack.stackSize);
            } else if (entity instanceof EntityArrow) {
                str = java.lang.String.format("Arrow Of [%s]", entity.shootingEntity.getDisplayName().getUnformattedText());
            } else continue;

            drawFaceToPlayer([entity.posX, entity.posY + 0.25, entity.posZ], function() {
                var width = mc.fontRendererObj.getStringWidth(str);
                Gui.drawRect(-width * 0.5 - 1, -mc.fontRendererObj.FONT_HEIGHT - 1, width * 0.5 + 1, 0, 0x7F000000);
                mc.fontRendererObj.drawStringWithShadow(str, -width * 0.5, -mc.fontRendererObj.FONT_HEIGHT, 0xFFFFFF);
            });
        }
    }
};
