const assert = require('assert');
const fs = require('fs');
const mock = require('mock-fs');
const { ignore } = require('../src/commands'); // Ensure this path is correct

describe('Gitignore Handling Tests', () => {
	beforeEach(() => {
		// Mock file system structure
		mock({
			'/repo': {
				'.gitignore': 'root_entry\n',
				subdir1: {
					'.gitignore': 'subdir1_entry\n',
					'file1.txt': '',
				},
				subdir2: {
					'file2.txt': '',
				},
				nested: {
					subdir3: {
						'.gitignore': '',
						'file3.txt': '',
					},
				},
			},
		});
	});

	afterEach(() => {
		mock.restore();
	});

	it('should add entry to the .gitignore in the same directory', async () => {
		const fileUri = { fsPath: '/repo/subdir1/file1.txt' };
		await ignore([fileUri]);

		const content = fs.readFileSync('/repo/subdir1/.gitignore', 'utf-8');
		assert(content.includes('file1.txt'), 'File should be added to the .gitignore in the same directory');
	});

	it('should fallback to the root .gitignore if no local .gitignore exists', async () => {
		const fileUri = { fsPath: '/repo/subdir2/file2.txt' };
		await ignore([fileUri]);

		const content = fs.readFileSync('/repo/.gitignore', 'utf-8');
		assert(content.includes('file2.txt'), 'File should be added to the root .gitignore if no local .gitignore exists');
	});

	it('should create a new .gitignore if none exists', async () => {
		const fileUri = { fsPath: '/repo/nested/subdir3/file3.txt' };
		await ignore([fileUri]);

		const content = fs.readFileSync('/repo/nested/subdir3/.gitignore', 'utf-8');
		assert(content.includes('file3.txt'), 'A new .gitignore should be created and the file added');
	});

	it('should not add duplicate entries to .gitignore', async () => {
		const fileUri = { fsPath: '/repo/subdir1/file1.txt' };
		await ignore([fileUri]);
		await ignore([fileUri]); // Try adding the same file again

		const content = fs.readFileSync('/repo/subdir1/.gitignore', 'utf-8');
		const occurrences = content.split('file1.txt').length - 1;
		assert.strictEqual(occurrences, 1, 'Duplicate entries should not be added to .gitignore');
	});

	it('should normalize file paths correctly', async () => {
		const fileUri = { fsPath: 'C:\\repo\\subdir1\\file1.txt' }; // Simulate Windows-style path
		await ignore([fileUri]);

		const content = fs.readFileSync('/repo/subdir1/.gitignore', 'utf-8');
		assert(content.includes('file1.txt'), 'Windows-style paths should be normalized to forward slashes');
	});

	it('should handle cases where the root directory has restricted permissions', async () => {
		fs.chmodSync('/repo/.gitignore', 0o444); // Make root .gitignore read-only

		const fileUri = { fsPath: '/repo/subdir2/file2.txt' };
		await assert.doesNotReject(async () => {
			await ignore([fileUri]);
		}, 'The function should gracefully handle permission errors');
	});

	it('should append entries to an empty .gitignore', async () => {
		const fileUri = { fsPath: '/repo/nested/subdir3/file3.txt' };
		await ignore([fileUri]);

		const content = fs.readFileSync('/repo/nested/subdir3/.gitignore', 'utf-8');
		assert.strictEqual(content.trim(), 'file3.txt', 'Entries should be added to an empty .gitignore');
	});
});
