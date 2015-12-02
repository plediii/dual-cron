"use strict";

module.exports = function (Domain, libs) {
    var CronJob = libs.CronJob || require('cron').CronJob;

    Domain.prototype.cron = function (cronTime, target) {
        var d = this;
        new CronJob({
            cronTime: cronTime
            , onTick: function () {
                d.send(target);
            }
            , start: true
        });
    };
};
