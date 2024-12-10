/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../../base/test/common/utils.js';
import { ToggleCellToolbarPositionAction } from '../../../browser/contrib/layout/layoutActions.js';
import { IncreaseEditorFontSizeAction, DecreaseEditorFontSizeAction } from '../../../../../browser/actions/layoutActions.js';
import { TestConfigurationService } from '../../../../../../platform/configuration/test/common/testConfigurationService.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { ServicesAccessor, ServiceIdentifier } from '../../../../../../platform/instantiation/common/instantiation.js';

suite('Layout Actions', () => {
	ensureNoDisposablesAreLeakedInTestSuite();
	let configurationService: TestConfigurationService;

	setup(() => {
		configurationService = new TestConfigurationService({ 'editor.fontSize': 14 });
	});

	function createAccessorWithConfigService(configService: TestConfigurationService): ServicesAccessor {
		return {
			get: <T>(id: ServiceIdentifier<T>): T => {
				if (id === IConfigurationService) {
					return configService as unknown as T;
				}
				throw new Error('Unknown service requested');
			}
		};
	}

	test('Increase Editor Font Size', async () => {
		const action = new IncreaseEditorFontSizeAction();
		const accessor = createAccessorWithConfigService(configurationService);

		await action.run(accessor);

		const newFontSize = configurationService.getValue('editor.fontSize') as number;
		assert.strictEqual(newFontSize, 15, `Font size should increase by 1 but was ${newFontSize}`);
	});

	test('Decrease Editor Font Size', async () => {
		await configurationService.updateValue('editor.fontSize', 14);

		const action = new DecreaseEditorFontSizeAction();
		const accessor = createAccessorWithConfigService(configurationService);

		await action.run(accessor);

		const newFontSize = configurationService.getValue('editor.fontSize') as number;
		assert.strictEqual(newFontSize, 13, `Font size should decrease by 1 but was ${newFontSize}`);
	});

	test('Decrease Editor Font Size should not go below 1', async () => {
		// Start at 1
		await configurationService.updateValue('editor.fontSize', 1);

		const action = new DecreaseEditorFontSizeAction();
		const accessor = createAccessorWithConfigService(configurationService);

		await action.run(accessor);

		const newFontSize = configurationService.getValue('editor.fontSize') as number;
		assert.strictEqual(newFontSize, 1, `Font size should not go below 1 but was ${newFontSize}`);
	});
});

suite('Notebook Layout Actions', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	test('Toggle Cell Toolbar Position', async function () {
		const action = new ToggleCellToolbarPositionAction();

		assert.deepStrictEqual(action.togglePosition('test-nb', 'right'), {
			default: 'right',
			'test-nb': 'left'
		});

		assert.deepStrictEqual(action.togglePosition('test-nb', 'left'), {
			default: 'left',
			'test-nb': 'right'
		});

		assert.deepStrictEqual(action.togglePosition('test-nb', 'hidden'), {
			default: 'hidden',
			'test-nb': 'right'
		});

		assert.deepStrictEqual(action.togglePosition('test-nb', ''), {
			default: 'right',
			'test-nb': 'left'
		});

		assert.deepStrictEqual(action.togglePosition('test-nb', {
			default: 'right'
		}), {
			default: 'right',
			'test-nb': 'left'
		});

		assert.deepStrictEqual(action.togglePosition('test-nb', {
			default: 'left'
		}), {
			default: 'left',
			'test-nb': 'right'
		});

		assert.deepStrictEqual(action.togglePosition('test-nb', {
			default: 'hidden'
		}), {
			default: 'hidden',
			'test-nb': 'right'
		});
	});
});

suite('Notebook Layout Actions', () => {
	ensureNoDisposablesAreLeakedInTestSuite();

	test('Toggle Cell Toolbar Position', async function () {
		const action = new ToggleCellToolbarPositionAction();

		// "notebook.cellToolbarLocation": "right"
		assert.deepStrictEqual(action.togglePosition('test-nb', 'right'), {
			default: 'right',
			'test-nb': 'left'
		});

		// "notebook.cellToolbarLocation": "left"
		assert.deepStrictEqual(action.togglePosition('test-nb', 'left'), {
			default: 'left',
			'test-nb': 'right'
		});

		// "notebook.cellToolbarLocation": "hidden"
		assert.deepStrictEqual(action.togglePosition('test-nb', 'hidden'), {
			default: 'hidden',
			'test-nb': 'right'
		});

		// invalid
		assert.deepStrictEqual(action.togglePosition('test-nb', ''), {
			default: 'right',
			'test-nb': 'left'
		});

		// no user config, default value
		assert.deepStrictEqual(action.togglePosition('test-nb', {
			default: 'right'
		}), {
			default: 'right',
			'test-nb': 'left'
		});

		// user config, default to left
		assert.deepStrictEqual(action.togglePosition('test-nb', {
			default: 'left'
		}), {
			default: 'left',
			'test-nb': 'right'
		});

		// user config, default to hidden
		assert.deepStrictEqual(action.togglePosition('test-nb', {
			default: 'hidden'
		}), {
			default: 'hidden',
			'test-nb': 'right'
		});
	});
});
