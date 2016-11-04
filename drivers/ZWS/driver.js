"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

// http://www.fakro.nl/producten/bedieningssystemen/elektrisch/bedienbare-apparaten/kettingmotoren/

module.exports = new ZwaveDriver(path.basename(__dirname), {
    capabilities: {
        windowcoverings_state: {
            command_class: 'COMMAND_CLASS_SWITCH_BINARY',
            command_get: 'SWITCH_BINARY_GET',
            command_set: 'SWITCH_BINARY_SET',
            command_set_parser: (value, node) => {
                let result = 'off/disable';

                // Check correct counter value in case of idle
                if (value === 'idle') {
                    if (node.state.position === 'on/enable') result = 'off/disable';
                    else if (node.state.position === 'off/disable') result = 'on/enable';
                } else if (value === 'up') {
                    result = 'on/enable';
                }

                // Save latest known position state
                if (node && node.state) {
                    node.state.position = result;
                }

                return {
                    'Switch Value': result
                };
            },
            command_report: 'SWITCH_BINARY_REPORT',
            command_report_parser: (report, node) => {

                // Save latest known position state
                if (node && node.state) {
                    node.state.position = report['Value']
                }

                switch (report['Value']) {
                    case 'on/enable':
                        return 'up';
                    case 'off/disable':
                        return 'down';
                    default:
                        return 'idle';
                }
            }
        }
    },
    settings: {
        
    }
});
