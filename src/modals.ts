import type { Folder } from "commands";
import * as fs from "fs";
import type VaultTransferPlugin from "main";
import { type App, FuzzySuggestModal, Modal, normalizePath, Setting, type TAbstractFile, TFile, TFolder } from "obsidian";
import type { VaultTransferSettings } from "settings";
import { transferFolder, transferNote } from "transfer";

/** Fuzzy modal where you can search a specific folder with the Path */


export class FolderSuggestModal extends FuzzySuggestModal<Folder> {
	plugin: VaultTransferPlugin;
	settings: VaultTransferSettings;
	app: App;
	toTransfer: TAbstractFile;
	foldersList: Folder[];

	constructor(plugin: VaultTransferPlugin, app: App, settings: VaultTransferSettings, folder: Folder[], toTransfer: TAbstractFile) {
		super(plugin.app);
		this.plugin = plugin;
		this.settings = settings;
		this.foldersList = folder;
		this.app = app;
		this.toTransfer = toTransfer;
	}

	getItems(): Folder[] {
		return this.foldersList;
	}

	getItemText(item: Folder): string {
		return item.relPath;
	}

    onChooseItem(item: Folder, _evt: MouseEvent | KeyboardEvent): void {
        if (item.absPath.length == 0) {
            new CreateFolder(this.app, this.plugin, this.settings, item, this.toTransfer).open();
        } else if (this.toTransfer instanceof TFolder) {
            transferFolder(this.toTransfer, this.plugin, item.absPath)
        } else if (this.toTransfer instanceof TFile) {
            transferNote(null, this.toTransfer, this.plugin, undefined, item.absPath);
        }
    }
}

class CreateFolder extends Modal {
	app: App;
	plugin: VaultTransferPlugin;
	settings: VaultTransferSettings;
	folder: Folder;
	toTransfer: TAbstractFile;

	constructor(app: App, plugin: VaultTransferPlugin, settings: VaultTransferSettings, folder: Folder, toTransfer: TAbstractFile) {
		super(app);
		this.app = app;
		this.plugin = plugin;
		this.settings = settings;
		this.folder = folder;
		this.toTransfer = toTransfer;
	}

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: 'Create new folder' });
        contentEl.createEl('p', { text: 'Please enter the name of the folder you want to create' });
        new Setting(contentEl)
            .setName('Folder name')
            .setDesc("The folder will use the output vault as root")
            .addText(text => text
                .setPlaceholder('Folder name')
                .setValue('')
                .onChange(async (value) => {
                    this.folder.relPath = value;
                    this.folder.absPath = `${this.settings.outputVault}/${value}`;
                })
            )
            .addButton((button) => {
                button
                    .setButtonText("Create folder")
                    .onClick(async () => {
                        fs.mkdirSync(normalizePath(this.folder.absPath), { recursive: true });
                        if (this.toTransfer instanceof TFolder) {
                            transferFolder(this.toTransfer, this.plugin, this.folder.absPath)
                        } else if (this.toTransfer instanceof TFile) {
                            transferNote(null, this.toTransfer, this.plugin, undefined, this.folder.absPath);
                        }
                        this.close();
                    })
            })
    }
}