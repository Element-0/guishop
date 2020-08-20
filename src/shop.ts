import { FormModule } from "./gui-common.js";
import { FormDefinitionBase, FormButtonBase, buildForm, mapFormDefintion, mapFormButton, sendUI, buildCustomForm, CustomFormDefinitionBase, mapCustomFormDefinition, sendModal } from "./gui-toolkit.js";

interface ShopCategoryDefinition extends FormButtonBase, FormDefinitionBase {
    name: string;
}

interface ShopItemDefinition<DescType> extends FormButtonBase {
    categoryName: string;
    desc: DescType;
    cost: number;
}

interface ShopPurchaseQuantityTemplate<DescType> extends CustomFormDefinitionBase {
    slideText: string;
    confirmTitle: string;
    getConfirmText(desc: DescType, text: string, price: number, quantity: number): string;
    button1: string;
    button2: string;
}

interface ShopPlayerInterface<DescType> {
    execute(desc: DescType, count: number): void;
    updateBalance(count: number): void;
    sendSuccessMessage(desc: DescType): void;
    sendCancelMessage(desc: DescType): void;
    getMax(desc: DescType): number;
}

interface ShopDefinition<DescType> extends FormDefinitionBase {
    categories: ShopCategoryDefinition[];
    items: ShopItemDefinition<DescType>[];
    template: ShopPurchaseQuantityTemplate<DescType>;
    getInterface(player: PlayerEntry): ShopPlayerInterface<DescType>;
}

function populateCategory<DescType>(def: ShopDefinition<DescType>) {
    const data = new Map<string, [ShopCategoryDefinition, ShopItemDefinition<DescType>[]]>();
    for (let category of def.categories)
        data.set(category.name, [category, []]);
    for (let item of def.items) {
        const [, arr] = data.get(item.categoryName);
        if (arr == null) {
            console.warn(`item ${item.text} is uncategorized.`);
            continue;
        }
        arr.push(item);
    }
    return data;
}

export function buildShopModule<DescType>(def: ShopDefinition<DescType>): FormModule {
    const populated = populateCategory(def);

    return player => buildForm(mapFormDefintion(def, ({ categories }) => mapFormButton(categories, ({ name }) => {
        const pair = populated.get(name);
        if (!pair) return;
        const [category, items] = pair;
        sendUI(player, buildForm(mapFormDefintion(category, () => mapFormButton(items, ({ desc, cost }, itemText) => {
            sendUI(player, buildCustomForm(mapCustomFormDefinition(def.template, ({ slideText, confirmTitle: title, getConfirmText, button1, button2 }) => {
                const ifce = def.getInterface(player);
                return {
                    content: [{
                        type: "slider",
                        text: slideText,
                        min: 1,
                        max: ifce.getMax(desc),
                    }],
                    cancel() { },
                    ok(count) {
                        sendModal(player, {
                            title,
                            content: getConfirmText(desc, itemText, cost, count),
                            button1,
                            button2,
                        }).then(() => {
                            ifce.updateBalance(count);
                            ifce.execute(desc, count);
                            ifce.sendSuccessMessage(desc);
                        }).catch(() => {
                            ifce.sendCancelMessage(desc);
                        })
                    }
                }
            })))
        }))));
    })));
}