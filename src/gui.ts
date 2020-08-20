import * as command from "ez:command";
import { sendUI } from "./gui-toolkit.js";
import { FormModule } from "./gui-common.js";

export interface GuiConfig {
    command: {
        name: string;
        desc: string;
        response: string;
    };
    ui: FormModule;
}

export function registerGuiCommand(cfg: GuiConfig) {
    const { name, desc } = cfg.command;
    command.registerCommand(name, desc, 0);
    command.registerOverride(name, [], entrypoint);

    function entrypoint(this: CommandOrigin): CommandHandlerResult {
        if (!this.player)
            throw ['commands.generic.error.invalidPlayer', `/${cfg.command.name}`];
        const player = this.player;
        sendUI(player, cfg.ui(player));
        return cfg.command.response;
    }
}