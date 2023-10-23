import { App, Modal, Setting, Notice } from 'obsidian';

export class NewEntryModal extends Modal {
    // The values of the different fields
    selectedValues: { [key: string]: any } = {};
    // The values of the fields whose results will be arrays (people, emotions)
    listInputs: { [key: string]: string[] } = { emotions: [], people: [] };

    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        // For css
        contentEl.addClass("dream-journal-modal");

        // A heading which ensures the user that they are typing a new dream entry
        contentEl.createEl("h1", { text: "Dream Entry" });

        // Create input fields
        const fields = [
            { id: 'title', label: 'Title', type: 'text' }, // Title of the dream
            { id: 'dream', label: 'Dream or nightmare?', type: 'dream' }, // Whether it was a dream or nightmare
            { id: 'rating', label: 'Dream Rating', type: 'number', range: [1, 10] }, // Rating of the dream
            { id: 'dreamLength', label: 'Dream Length', type: 'number', range: [1, 10] }, // Length of the dream
            { id: 'sleepQuality', label: 'Sleep Quality', type: 'number', range: [1, 10] }, // The quality of the users sleep
            { id: 'inDream', label: 'Personally in the dream?', type: 'checkbox' }, // Whether or not the user personally was in the dream
            { id: 'emotions', label: 'Emotions', type: 'text' }, // The emotions experienced in the dream
            { id: 'mood', label: 'Corresponds to mood?', type: 'checkbox' }, // Whether or not the dreams emotions corresponds to the users current mood
            { id: 'linkedContext', label: 'Linked to a context?', type: 'checkbox' }, // Whether or not the dream is linked to a context
            { id: 'context', label: 'Context', type: 'text' }, // ... If it is, then what is the context?
            { id: 'recurring', label: 'Recurring Dream?', type: 'checkbox' }, // Is the dream recurring?
            { id: 'people', label: 'People', type: 'text' }, // Which people were present in the dream
            { id: 'lucid', label: 'Lucid dream?', type: 'checkbox' }, // Was it a lucid dream?
            { id: 'control', label: 'Can control dream?', type: 'checkbox' }, // Could the user control the dream?
            { id: 'vividness', label: 'Vividness', type: 'number', range: [1, 10] }, // How vivid was the dream? 
        ];



        // Function which creates the UI for the creation of arrays
        // Used for emotions and people
        // Uses an index to make sure that the correct index of the array is changed.
        // Calls itself, when making a new input in the UI
        const createListInputSetting = (contentEl: HTMLElement, key: string, index: number, insertAfterEl?: HTMLElement) => {
            const settingContainer = document.createElement('div');

            if (insertAfterEl) {
                insertAfterEl.insertAdjacentElement('afterend', settingContainer);
            } else {
                contentEl.appendChild(settingContainer);
            }


            // Input to the array, both text and button
            new Setting(settingContainer)
                .setName(key === "people" ? "Person" : "Emotion")
                // Text input to put emotion/person
                .addText(text => text
                    .setPlaceholder('Enter value')
                    .onChange(value => {
                        if (index < this.listInputs[key].length) {
                            // Update the existing value at the specific index
                            this.listInputs[key][index] = value;
                        } else {
                            // Add the new value to the list
                            this.listInputs[key].push(value);
                        }
                    }))
                // Button to add new input + button
                .addButton(button => button
                    .setButtonText('+')
                    .onClick(e => {
                        e.preventDefault();
                        // Insert a new Setting after the current one with an incremented index
                        createListInputSetting(contentEl, key, index + 1, settingContainer);
                    }));
        };

        // Input to write contents of the dream
        new Setting(contentEl)
            .setName("Content")
            .addTextArea((text) => {
                text.setPlaceholder("Add the contents of your dream")
                text.onChange((value) => {
                    this.selectedValues['content'] = value;
                })
            });

        // For each of the fields
        fields.forEach(field => {
            // If the field is of type number, create a dropdown with the specified range
            if (field.type === 'number' && field.range) {
                new Setting(contentEl)
                    .setName(field.label)
                    .addDropdown(dropdown => {
                        for (let i = field.range[0]; i <= field.range[1]; i++) {
                            dropdown.addOption(i.toString(), i.toString());
                        }
                        dropdown.onChange(value => {
                            this.selectedValues[field.id] = parseInt(value);
                        });
                    });
                // If the field is either emotions or people, use createListInputSetting to make an array
            } else if (field.id === "emotions" || field.id === "people") {
                new Setting(contentEl)
                    .setName(field.id.charAt(0).toUpperCase() + field.id.slice(1))
                    .setHeading();
                createListInputSetting(contentEl, field.id, 0);
            // Context text input
            } else if (field.id === "context") {
                new Setting(contentEl)
                    .setName("Context")
                    .addText((text) => {
                        text.setPlaceholder("Add context if applicable")
                        text.onChange(value => {
                            this.selectedValues[field.id] = value;
                        });
                    });
            // Let user decide whether or not their dream was a dream or nightmare
            } else if (field.type === "dream") {
                new Setting(contentEl)
                    .setName(field.label)
                    .addDropdown(dropdown => {
                        dropdown.addOption('Dream', 'Dream');
                        dropdown.addOption('Nightmare', 'Nightmare');
                        dropdown.onChange(value => {
                            this.selectedValues['dream'] = value;
                        });
                    });
            // Text input for title
            } else if (field.id === "title") {
                new Setting(contentEl)
                    .setName(field.label)
                    .addText((text) => {
                        text.setPlaceholder("Add an optional title")
                        text.onChange(value => {
                            this.selectedValues[field.id] = value;
                        });
                    });
            // Instead of using HTML checkboxes, we use toggles, which can either be toggled on or off. 
            // However, if this is not changed to true, it returns "undefined". 
            // This is handled in saveData function.
            } else if (field.type === "checkbox") {
                new Setting(contentEl)
                    .setName(field.label.charAt(0).toUpperCase() + field.label.slice(1))
                    .addToggle((value) => {
                        value.onChange((value) => {
                            console.log(value);
                            this.selectedValues[field.id] = value;
                        })
                    })
            } else {
                // Something is wrong
                console.log("A problem occurred in field ", field.id);
            }
        });

        // Button which, when pressed, calls the saveData() function
        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Save Entry")
                    .setCta()
                    .onClick(() => {
                        this.saveData();
                    }));
    }

    // Function to save the from the form to a file
    async saveData() {
        // This function is used for array values; i.e. emotions and people
        const getListValues = (key: string): string[] => {
            return this.listInputs[key].map(input => this.escapeYAMLString(input)).filter(val => val);
        };

        const dreamContent = this.selectedValues['content'] || "Dream not written down";
        const title = this.selectedValues['title'] || new Date().toISOString().split('T')[0];
        const dreamType = this.selectedValues['dream'] || "";
        const rating = this.selectedValues['rating'] || "";
        const dreamLength = this.selectedValues['dreamLength'] || "";
        const sleepQuality = this.selectedValues['sleepQuality'] || "";
        const vividness = this.selectedValues['vividness'] || "";

        // For the toggles, if it returns "undefined", write "false" instead.
        const inDream = this.selectedValues['inDream'] || "false";
        const mood = this.selectedValues['mood'] || "false";
        const context = this.selectedValues['context'] || "false";
        const recurring = this.selectedValues['recurring'] || "false";
        const lucid = this.selectedValues['lucid'] || "false";
        const control = this.selectedValues['control'] || "false";

        const emotionsList = getListValues('emotions');
        const peopleList = getListValues('people');

        const content = `---
Title: ${title}
Date: ${new Date().toISOString().split('T')[0]}
Type: "[[${dreamType}]]"
Rating: ${rating}
Dream Length: ${dreamLength}
Sleep Quality: ${sleepQuality}
Personally In The Dream?: ${inDream}
Emotions:
  - ${emotionsList.map(emotion => `\"[[${emotion}]]\"`).join('\n  - ')}
Corresponds to Mood?: ${mood}
Context: ${context}
Recurring Dream?: ${recurring}
People:
  - ${peopleList.map(person => `\"[[${person}]]\"`).join('\n  - ')}
Lucid Dream: ${lucid}
Can Control Dream: ${control}
Vividness: ${vividness}
---

${dreamContent}
`;

        // Save to a file in Obsidian
        const vault = this.app.vault;
        const fileName = `${title}.md`;
        let file = await vault.getAbstractFileByPath(fileName);

        if (!file) {
            file = await vault.create(fileName, content);
            new Notice('Dream entry created!');
        } else {
            await vault.modify((<TFile>file), content);
            new Notice('Dream entry updated!');
        }

        this.close();
    }

    // Escapes : to \: in YAML
    escapeYAMLString(str?: string): string {
        if (typeof str !== 'string') {
            console.warn('escapeYAMLString received a non-string value:', str);
            return '';
        }
        return str.replace(/:/g, "\\:");
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}