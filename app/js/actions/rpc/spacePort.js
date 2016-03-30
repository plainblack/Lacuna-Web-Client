'use strict';

var Reflux  = require('reflux');

var SpacePortRPCActions = Reflux.createActions([
    'requestSpacePortRPCView',
    'successSpacePortRPCView',
    'failureSpacePortRPCView',

    'requestSpacePortRPCViewAllFleets',
    'successSpacePortRPCViewAllFleets',
    'failureSpacePortRPCViewAllFleets',

    'requestSpacePortRPCViewIncomingFleets',
    'successSpacePortRPCViewIncomingFleets',
    'failureSpacePortRPCViewIncomingFleets',

    'requestSpacePortRPCViewAvailableFleets',
    'successSpacePortRPCViewAvailableFleets',
    'failureSpacePortRPCViewAvailableFleets',

    'requestSpacePortRPCViewUnavailableFleets',
    'successSpacePortRPCViewUnavailableFleets',
    'failureSpacePortRPCViewUnavailableFleets',

    'requestSpacePortRPCViewOrbitingFleets',
    'successSpacePortRPCViewOrbitingFleets',
    'failureSpacePortRPCViewOrbitingFleets',

    'requestSpacePortRPCViewMiningPlatforms',
    'successSpacePortRPCViewMiningPlatforms',
    'failureSpacePortRPCViewMiningPlatforms',

    'requestSpacePortRPCViewExcavators',
    'successSpacePortRPCViewExcavators',
    'failureSpacePortRPCViewExcavators',

    'requestSpacePortRPCSendFleet',
    'successSpacePortRPCSendFleet',
    'failureSpacePortRPCSendFleet',

    'requestSpacePortRPCRecallFleet',
    'successSpacePortRPCRecallFleet',
    'failureSpacePortRPCRecallFleet',

    'requestSpacePortRPCRenameFleet',
    'successSpacePortRPCRenameFleet',
    'failureSpacePortRPCRenameFleet',

    'requestSpacePortRPCScuttleFleet',
    'successSpacePortRPCScuttleFleet',
    'failureSpacePortRPCScuttleFleet',

    'requestSpacePortRPCViewTravellingFleets',
    'successSpacePortRPCViewTravellingFleets',
    'failureSpacePortRPCViewTravellingFleets',

    'requestSpacePortRPCPrepareSendSpies',
    'successSpacePortRPCPrepareSendSpies',
    'failureSpacePortRPCPrepareSendSpies',

    'requestSpacePortRPCSendSpies',
    'successSpacePortRPCSendSpies',
    'failureSpacePortRPCSendSpies',

    'requestSpacePortRPCPrepareFetchSpies',
    'successSpacePortRPCPrepareFetchSpies',
    'failureSpacePortRPCPrepareFetchSpies',

    'requestSpacePortRPCFetchSpies',
    'successSpacePortRPCFetchSpies',
    'failureSpacePortRPCFetchSpies',

    'requestSpacePortRPCViewBattleLog',
    'successSpacePortRPCViewBattleLog',
    'failureSpacePortRPCViewBattleLog'

]);

module.exports = SpacePortRPCActions;
