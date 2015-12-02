"use strict";

var test = require('tape');
var pathlib = require('path');
var dualapi = require('dualapi');
var EventEmitter = require('events');

test('dual-cron', function (t) {

    var mockCronJob = function (params) {
        if (!params.emitter) {
            throw new Error('emitter required for mockCronJob');
        }
        var emitter = params.emitter;
        return function (cronParams) {
            var onTick = cronParams.onTick || function () {};
            emitter.on('fire', function () {
                onTick();
            });
        };
    };
    
    var makeDomain = function (CronJob) {
        return (dualapi
                .use(function (Domain, libs) {
                    libs.CronJob = CronJob;
                })
                .use(require('..'))
               )();
    };

    t.test('Should use first argument as crontab time', function (s) {
        s.plan(1);
        var d = makeDomain(function (params) {
            s.equal(params.cronTime, 'mocked date');
        });
        d.cron('mocked date', ['cron-target']);
    });

    t.test('Should start crontab', function (s) {
        s.plan(1);
        var d = makeDomain(function (params) {
            s.ok(params.start, 'Should tell CronJob to start');
        });
        d.cron('mocked date', ['cron-target']);
    });


    t.test('Should send message on CronTab tick', function (s) {
        s.plan(1);
        var emitter = new EventEmitter();
        var d = makeDomain(mockCronJob({
            emitter: emitter
        }));
        d.mount(['cron-target'], function () {
            s.pass('cron event emitted.');
        });
        d.cron('mocked date', ['cron-target']);
        emitter.emit('fire');
    });
});
