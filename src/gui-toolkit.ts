import * as form from "ez:formui";

export interface FormInfo {
    data: any;
    callback: (data: any) => void;
}

export interface IconSpec {
    type: "url" | "path";
    data: string;
}

export function localIcon(path: string): IconSpec {
    return {
        type: "path",
        data: path,
    }
}

export function remoteIcon(url: string): IconSpec {
    return {
        type: "url",
        data: url,
    }
}

export interface FormButtonBase {
    text: string;
    image?: IconSpec;
}

export interface FormButton extends FormButtonBase {
    handler: () => void;
}

export function mapFormButton<T extends FormButtonBase>(input: T[], fn: (input: Omit<T, keyof FormButtonBase>, text: string) => void): FormButton[] {
    return input.map(({ text, image, ...rest }) => ({
        text,
        image,
        handler: () => fn(rest, text)
    }));
}

export interface FormDefinitionBase {
    title: string;
    content: string;
}

export interface FormDefinition extends FormDefinitionBase {
    buttons: FormButton[]
}

export function mapFormDefintion<T extends FormDefinitionBase>({ title, content, ...rest }: T, fn: (input: Omit<T, keyof FormDefinitionBase>) => FormButton[]): FormDefinition {
    return {
        title,
        content,
        buttons: fn(rest)
    };
}

export function buildForm({ title, content, buttons }: FormDefinition): FormInfo {
    return {
        data: {
            type: "form",
            title,
            content,
            buttons: buttons.map(({ text, image }) => ({ text, image }))
        },
        callback(resp: any) {
            if (typeof resp != "number") return;
            const btn = buttons[resp];
            if (btn) btn.handler();
        }
    }
}

export interface ModalFormBase {
    title: string;
    content: string;
    button1: string;
    button2: string;
}

export interface ModalForm extends ModalFormBase {
    ok(): void;
    cancel(): void;
}

export function buildModalForm({ title, content, button1, button2, ok, cancel }: ModalForm): FormInfo {
    return {
        data: {
            type: "modal",
            title,
            content,
            button1,
            button2
        },
        callback(resp: any) {
            if (typeof resp != "boolean") return;
            if (resp) ok();
            else cancel();
        }
    }
}

export function sendModal(player: PlayerEntry, info: ModalFormBase): Promise<void> {
    return new Promise((ok, cancel) => {
        sendUI(player, buildModalForm({ ...info, ok, cancel }));
    });
}

export type CustomFormControl = {
    type: "label";
    text: string;
    changed?(v: undefined): void;
} | {
    type: "input";
    text: string;
    default?: string;
    placeholder?: string;
    changed?(str: string): void;
} | {
    type: "slider";
    text: string;
    min: number;
    max: number;
    default?: number;
    changed?(str: number): void;
} | {
    type: "step_slider";
    text: string;
    steps: string[];
    default?: string;
    changed?(str: number): void;
} | {
    type: "toggle";
    text: string;
    default?: boolean;
    changed?(val: boolean): void;
} | {
    type: "dropdown",
    text: string;
    options: string[];
    changed?(str: number): void;
}

export interface CustomFormDefinitionBase {
    title: string;
}

export interface CustomFormDefinition extends CustomFormDefinitionBase {
    content: CustomFormControl[];
    ok?: (...resp: any[]) => void;
    cancel?: () => void;
}

export function mapCustomFormDefinition<T extends CustomFormDefinitionBase>(
    { title, ...rest }: T,
    fn: (inp: Omit<T, keyof CustomFormDefinitionBase>) => Omit<CustomFormDefinition, keyof CustomFormDefinitionBase>
): CustomFormDefinition {
    return {
        title,
        ...fn(rest)
    };
}

export function buildCustomForm({ title, content, cancel, ok }: CustomFormDefinition): FormInfo {
    return {
        data: {
            type: "custom_form",
            title,
            content: content.map(({ changed, ...rest }) => rest)
        },
        callback(resp: any) {
            if (!Array.isArray(resp)) {
                if (cancel) cancel();
                return;
            }
            if (resp.length != content.length) return;
            for (let i = 0; i < resp.length; i++) {
                const curcnt = content[i];
                const currep = resp[i];
                if (curcnt.changed) {
                    if ("default" in curcnt) {
                        if (curcnt.default === currep) continue;
                    }
                    curcnt.changed(currep as any);
                }
            }
            if (ok) ok.apply(null, resp);
        }
    }
}

export function sendUI(player: PlayerEntry, info: FormInfo) {
    form.send(player, info.data, info.callback);
}