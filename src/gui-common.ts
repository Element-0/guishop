import { buildForm, FormDefinition, FormDefinitionBase, FormButtonBase, FormInfo, mapFormDefintion, mapFormButton, sendUI } from "./gui-toolkit.js";

export type FormModule = (player: PlayerEntry) => FormInfo;

export interface ModuleConfig extends FormButtonBase {
    generate: FormModule;
}

export function makeSimpleForm(def: FormDefinition) {
    return () => buildForm(def);
}

export interface CategoryForm extends FormDefinitionBase {
    modules: ModuleConfig[];
}

export function makeCategoryForm(def: CategoryForm) {
    return (player: PlayerEntry) => buildForm(mapFormDefintion(def, ({ modules }) =>
        mapFormButton(modules,
            ({ generate }) => sendUI(
                player,
                generate(player)
            )
        )));
}