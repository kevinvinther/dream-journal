import { App, Plugin } from 'obsidian';
import { DreamJournalSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { NewEntryModal } from './NewEntryModal';

export default class DreamJournal extends Plugin {
	settings: DreamJournalSettings;

	async onload() {
		await this.loadSettings();

		// New Command
		// id: new-dream-entry
		// name: Add new dream journal entry
		//
		// When the user types the name in the commands, 
		// the NewEntryModal pops up.
		this.addCommand({
			id: "new-dream-entry",
			name: "Add new dream journal entry",
			callback: () => {
				new NewEntryModal(this.app).open();
			}
		})


		// TODO
		// New Command
		// id: show-dream-statistics
		// name: Open dream statistics
		//
		// When the user types the name in the commands, 
		// the user is shown the StatisticsModal, which
		// shows the statistics of their dreams.
		this.addCommand({
			id: "show-dream-statistics",
			name: "Open dream statistics",
			callback: () => {
				new NewEntryModal(this.app).open();
			}
		})


		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}



