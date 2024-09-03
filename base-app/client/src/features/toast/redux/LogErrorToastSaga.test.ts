import { PayloadAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";

import { ToastOptions } from "../types";
import { showToast, startToast } from "./toastSlice";
import { expectSaga } from 'redux-saga-test-plan';
import { logErrorToasts, sendToAnalytics } from "./LogErrorToastSaga";

const errorToastOptions: ToastOptions = {
    title: 'Its time to panic',
    status: 'error'
}
const normalToastOptions: ToastOptions = {
    title: 'Working correctly',
    status: 'info'
}

const errorToastAction = {
    type: 'test',
    payload: errorToastOptions
}

const normalToastAction = {
    type: 'test',
    payload: normalToastOptions
}

// call was used here but so can put and take
test('saga calls the analytics engine when we recieve an error toast', () => {
    // return is needed because the saga is async and without it, it would finish before the saga itself
    return expectSaga(logErrorToasts, errorToastAction)
    .call(sendToAnalytics, 'Its time to panic')
    .run()
})

test('saga doesnt call the ananyltics engine when there is no error', () => {
    return expectSaga(logErrorToasts, normalToastAction)
    // using partial assertion here because we only care that the function wasn't called, that's why we dropped the arguement
    .not.call.fn(sendToAnalytics)

    // this way isn't necessary because the arguement isn't needed, as we are only testing that the function wasn't called
    // .not.call(sendToAnalytics, 'Working correctly')

    .run()
})
