import * as shop from "./shop.js";
import { localIcon } from "./gui-toolkit.js";
import { executeCommand } from "ez:command";
import { updateBalance } from "ez:economy";
import { registerGuiCommand } from "./gui.js";
import { makeCategoryForm } from "./gui-common.js";

const shopmod = shop.buildShopModule({
    title: "shop的标题",
    content: "shop的内容",
    categories: [{
        name: "类别A",
        text: "类别A的显示名字",
        image: localIcon("textures/ui/icon_recipe_construction"),
        title: "类别A的标题",
        content: "类别A的说明",
    }, {
        name: "类别B",
        text: "类别B的显示名字",
        image: localIcon("textures/ui/icon_recipe_equipment"),
        title: "类别B的标题",
        content: "类别B的说明",
    }],
    items: [{
        categoryName: "类别A",
        text: "假装是第一种木头",
        image: localIcon("textures/blocks/planks_oak"),
        desc: "minecraft:planks",
        cost: 5,
    }, {
        categoryName: "类别B",
        text: "假装是第二种木头",
        image: localIcon("textures/blocks/crimson_planks"),
        desc: "minecraft:crimson_planks",
        cost: 10,
    }],
    template: {
        title: "数量确认",
        slideText: "滑块文本",
        confirmTitle: "确认购买标题",
        getConfirmText(name, text, price, count) {
            return `名字: ${name} 显示文本: ${text} 价格: ${price} 数量: ${count} 合计: ${price * count}`;
        },
        button1: "确认购买",
        button2: "放弃购买"
    },
    getInterface(player: PlayerEntry) {
        return {
            execute(desc: string, count: number): void {
                executeCommand(`/give "${player.name}" ${desc} ${count}`);
            },
            updateBalance(count: number): void {
                updateBalance(player, count, "购买商品");
            },
            sendSuccessMessage(desc: string): void {
                executeCommand(`/tell "${player.name}" 购买 ${desc} 成功`);
            },
            sendCancelMessage(desc: string): void {
                executeCommand(`/tell "${player.name}" 购买 ${desc} 失败`);
            },
            getMax(desc: string): number {
                return 64;
            }
        };
    }
});

registerGuiCommand({
    command: {
        name: "gui",
        desc: "commands.gui.description",
        response: "ok",
    },
    ui: makeCategoryForm({
        title: "标题",
        content: "内容",
        modules: [{
            text: "购物",
            image: localIcon("textures/ui/MCoin"),
            generate: shopmod
        }]
    })
})