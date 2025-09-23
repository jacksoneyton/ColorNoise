/**
 * ColorNoise Admin Tool
 * Preset Management System
 */

class PresetManager {
    constructor() {
        this.presets = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPresets();
    }

    setupEventListeners() {

        // File upload
        const fileInput = document.getElementById('presetFile');
        const dropZone = document.getElementById('fileDropZone');

        fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        // Forms
        document.getElementById('uploadForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.uploadPreset();
        });

        document.getElementById('createForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createPreset();
        });
    }


    handleFileSelect(file) {
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            this.showStatus('uploadStatus', 'error', 'Please select a JSON file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = JSON.parse(e.target.result);
                this.showStatus('uploadStatus', 'success', `File "${file.name}" loaded successfully.`);

                // Auto-fill preset name from filename
                const nameWithoutExt = file.name.replace('.json', '');
                document.getElementById('presetName').value = this.formatPresetName(nameWithoutExt);

                // Store the preset data
                this.uploadedPresetData = content;

            } catch (error) {
                this.showStatus('uploadStatus', 'error', 'Invalid JSON file. Please check the format.');
                console.error('JSON parse error:', error);
            }
        };
        reader.readAsText(file);
    }

    formatPresetName(filename) {
        // Convert filename to readable preset name
        return filename
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    }

    async uploadPreset() {
        if (!this.uploadedPresetData) {
            this.showStatus('uploadStatus', 'error', 'Please select a JSON file first.');
            return;
        }

        const name = document.getElementById('presetName').value.trim();
        if (!name) {
            this.showStatus('uploadStatus', 'error', 'Please enter a preset name.');
            return;
        }

        const description = document.getElementById('presetDescription').value.trim();

        try {
            const preset = {
                name: name,
                description: description,
                data: this.uploadedPresetData,
                created: new Date().toISOString(),
                id: this.generateId()
            };

            await this.savePreset(preset);
            this.showStatus('uploadStatus', 'success', `Preset "${name}" saved successfully!`);

            // Reset form
            this.resetUploadForm();
            this.loadPresets();

        } catch (error) {
            this.showStatus('uploadStatus', 'error', 'Failed to save preset. Please try again.');
            console.error('Save error:', error);
        }
    }

    async createPreset() {
        const name = document.getElementById('createPresetName').value.trim();
        if (!name) {
            this.showStatus('createStatus', 'error', 'Please enter a preset name.');
            return;
        }

        const jsonText = document.getElementById('presetJSON').value.trim();
        if (!jsonText) {
            this.showStatus('createStatus', 'error', 'Please enter preset configuration JSON.');
            return;
        }

        try {
            const data = JSON.parse(jsonText);
            const description = document.getElementById('createPresetDescription').value.trim();

            const preset = {
                name: name,
                description: description,
                data: data,
                created: new Date().toISOString(),
                id: this.generateId()
            };

            await this.savePreset(preset);
            this.showStatus('createStatus', 'success', `Preset "${name}" created successfully!`);

            // Reset form
            this.resetCreateForm();
            this.loadPresets();

        } catch (error) {
            this.showStatus('createStatus', 'error', 'Invalid JSON format. Please check your configuration.');
            console.error('Create error:', error);
        }
    }

    async savePreset(preset) {
        // Add preset to array
        this.presets.push(preset);

        // Save to localStorage (in a real implementation, this would be server-side)
        localStorage.setItem('colorNoisePresets', JSON.stringify(this.presets));

        // Create manifest for easy loading
        await this.updateManifest();
    }

    async updateManifest() {
        const manifest = {
            version: '1.0.0',
            updated: new Date().toISOString(),
            presets: this.presets.map(preset => ({
                id: preset.id,
                name: preset.name,
                description: preset.description,
                created: preset.created
            }))
        };

        localStorage.setItem('colorNoiseManifest', JSON.stringify(manifest));
    }

    loadPresets() {
        try {
            const stored = localStorage.getItem('colorNoisePresets');
            this.presets = stored ? JSON.parse(stored) : [];
            this.renderPresetsList();
        } catch (error) {
            console.error('Error loading presets:', error);
            this.presets = [];
        }
    }

    renderPresetsList() {
        const container = document.getElementById('presetsList');

        if (this.presets.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 32px;">No presets found. Upload some presets to get started!</p>';
            return;
        }

        let html = `
            <div style="margin-bottom: 32px;">
                <h3 style="color: var(--primary-accent); margin-bottom: 16px; font-size: 1.2rem;">All Presets (${this.presets.length})</h3>
                ${this.presets.map(preset => this.renderPresetItem(preset)).join('')}
            </div>
        `;

        container.innerHTML = html;
    }

    renderPresetItem(preset) {
        const createdDate = new Date(preset.created).toLocaleDateString();
        return `
            <div class="preset-item">
                <div class="preset-info">
                    <div class="preset-name">${preset.name}</div>
                    <div class="preset-meta">
                        ${preset.description ? preset.description + ' • ' : ''}
                        Created: ${createdDate}
                    </div>
                </div>
                <div class="preset-actions">
                    <button class="btn btn-secondary" onclick="presetManager.downloadPreset('${preset.id}')">
                        📥 Download
                    </button>
                    <button class="btn btn-error" onclick="presetManager.deletePreset('${preset.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }

    downloadPreset(presetId) {
        const preset = this.findPresetById(presetId);
        if (!preset) return;

        const dataStr = JSON.stringify(preset.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = `${preset.name.replace(/\s+/g, '_').toLowerCase()}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    deletePreset(presetId) {
        if (!confirm('Are you sure you want to delete this preset? This action cannot be undone.')) {
            return;
        }

        // Remove from presets array
        this.presets = this.presets.filter(p => p.id !== presetId);

        // Save and update
        localStorage.setItem('colorNoisePresets', JSON.stringify(this.presets));
        this.updateManifest();
        this.loadPresets();
    }

    findPresetById(presetId) {
        return this.presets.find(p => p.id === presetId) || null;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showStatus(elementId, type, message) {
        const element = document.getElementById(elementId);
        element.className = `status-message status-${type}`;
        element.textContent = message;
        element.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }

    resetUploadForm() {
        document.getElementById('presetName').value = '';
        document.getElementById('presetDescription').value = '';
        document.getElementById('presetFile').value = '';
        this.uploadedPresetData = null;
    }

    resetCreateForm() {
        document.getElementById('createPresetName').value = '';
        document.getElementById('createPresetDescription').value = '';
        document.getElementById('presetJSON').value = '';
    }
}

// Global functions
function validateJSON() {
    const jsonText = document.getElementById('presetJSON').value.trim();
    if (!jsonText) {
        presetManager.showStatus('createStatus', 'warning', 'Please enter JSON to validate.');
        return;
    }

    try {
        JSON.parse(jsonText);
        presetManager.showStatus('createStatus', 'success', 'JSON is valid! ✅');
    } catch (error) {
        presetManager.showStatus('createStatus', 'error', `Invalid JSON: ${error.message}`);
    }
}

function refreshPresets() {
    presetManager.loadPresets();
}

function exportAllPresets() {
    const allPresets = localStorage.getItem('colorNoisePresets');
    if (!allPresets) {
        alert('No presets to export.');
        return;
    }

    const dataStr = allPresets;
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `colornoise_all_presets_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Initialize
const presetManager = new PresetManager();