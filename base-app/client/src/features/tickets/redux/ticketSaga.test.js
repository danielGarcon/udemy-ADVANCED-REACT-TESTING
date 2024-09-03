import { PayloadAction } from "@reduxjs/toolkit";
import axios, { CancelTokenSource } from "axios";
import { SagaIterator } from "redux-saga";
import {
  call,
  cancel,
  cancelled,
  put,
  race,
  select,
  take,
  takeEvery,
} from "redux-saga/effects";

import { HoldReservation } from "../../../../../shared/types";
import { startToast } from "../../toast/redux/toastSlice";

import { ToastOptions } from "../../toast/types";
import {
  cancelPurchaseServerCall,
  releaseServerCall,
  reserveTicketServerCall,
} from "../api";
import { TicketAction } from "../types";
import {
  endTransaction,
  holdTickets,
  PurchasePayload,
  ReleasePayload,
  resetTransaction,
  selectors,
  startTicketAbort,
  startTicketPurchase,
  startTicketRelease,
} from "./ticketSlice";
import { expectSaga } from "redux-saga-test-plan";
import { generateErrorToastOptions,  cancelTransaction, purchaseTickets, ticketFlow } from "./ticketSaga";
import { holdReservation, purchaseReservation, purchasePayload } from "../../../test-utils/fake-data";
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError, StaticProvider } from 'redux-saga-test-plan/providers'


const holdAction = {
    type: 'test',
    payload: holdReservation
}
const cancelAction = {
    type: 'test', 
    payload: cancelTransaction
}
// const startToast = (options) => ({
//     type: 'START_TOAST',
//     payload: options,
// });
const networkProviders: Array<StaticProvider> = [
    [matchers.call.fn(reserveTicketServerCall), null],
    [matchers.call.fn(releaseServerCall), null],
    [matchers.call.fn(cancelPurchaseServerCall), null],
  ];

test("cancelTransaction cancels hold and resets transaction", () => {
    return expectSaga(cancelTransaction, holdReservation)
      .provide(networkProviders)
      .call(releaseServerCall, holdReservation)
      .put(resetTransaction())
      .run();
  });

describe('common to all flows', () => {
    // this is an intergration test
    test('starts with hold call to server', () => {
        return expectSaga(ticketFlow, holdAction)
        // provide allows us to mock the values of the functions called by the saga
        .provide(networkProviders)
        // when you see "take" ina saga, using dispatch in your test can help move the saga along
        .dispatch(startTicketAbort({ reservation: holdReservation, reason: 'Abort' } ))
        .call(reserveTicketServerCall, holdReservation)
        .run()
    })

    test('show error toast and clean up after server error', () => {
        return expectSaga(ticketFlow, holdAction)
            .provide([
                [matchers.call.fn(releaseServerCall), throwError(new Error('it didnt work'))],
                [matchers.select.selector(selectors.getTicketAction), TicketAction.hold],
                // [matchers.call.fn(reserveTicketServerCall), null],
                [matchers.call.fn(releaseServerCall), null],

                   // we use the spread operator here so that in our test on line 61 the first time those requests are found they're mocked
                // then each time after that they're ignored, that's wht we used the spread operator
                ...networkProviders
             
            ])
            // .put here is used to deal with a select in the saga
            // here is the line -> const ticketAction = yield select(selectors.getTicketAction);
            .put(
                startToast(
                    generateErrorToastOptions('It didnt work', TicketAction.hold)
                )
            )
            .call(cancelTransaction, holdReservation)
            .run();
    });

    // test('server hold is released when ticket is cancelled', () => {
    //     return expectSaga(ticketFlow, holdAction)
    //     .provide([
    //         [matchers.call.fn(cancelTransaction, null)]
    //     ])
    //     .put(releaseServerCall(holdReservation))
    //     .call(cancelTransaction, holdReservation)
    //     .run()
    // })
})