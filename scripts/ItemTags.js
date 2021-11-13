script = registerScript({
    name: "ItemTags",
    authors: ["MyScarlet"],
    version: "1.0"
});

script.import("Core.lib");
script.import("utils/RenderUtils.js");

module = {
    name: "ItemTags",
    category: "Render",
    description: "Show NameTag for EntityItem.",
    onRender3D: function () {
        Java.from(mc.theWorld.loadedEntityList)
            .filter(function(it) it instanceof EntityItem)
            .forEach(function(entity) {
                var stack = entity.getEntityItem();
                drawFaceToPlayer([entity.posX, entity.posY + 0.25, entity.posZ], function () {
                    var str = stack.getDisplayName() + " *" + stack.stackSize;
                    var width = mc.fontRendererObj.getStringWidth(str);
                    Gui.drawRect(-width * 0.5 - 1, -mc.fontRendererObj.FONT_HEIGHT - 1, width * 0.5 + 1, 0, 0x7F000000);
                    mc.fontRendererObj.drawString(str, -width * 0.5, -mc.fontRendererObj.FONT_HEIGHT, 0xFFFFFF);
                });
            });
    }
};
