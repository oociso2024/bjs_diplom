"use strict";

const logoutButton = new LogoutButton();
const ratesBoard = new RatesBoard();
const moneyManager = new MoneyManager();
const favoritesWidget = new FavoritesWidget();

let callbackFunction = method => response => (response.success) && method(response.data);

function updateTable(data) {
    ratesBoard.clearTable();
    ratesBoard.fillTable(data);
}

let updateStocks = () => ApiConnector.getStocks(callbackFunction(updateTable));

logoutButton.action = () => ApiConnector.logout(callbackFunction(window.location.reload.bind(window.location)));
ApiConnector.current(callbackFunction(ProfileWidget.showProfile));
ApiConnector.getFavorites(callbackFunction(updateFavorites));
updateStocks();
setInterval(updateStocks, 60000);

function updateFavorites(data) {
    favoritesWidget.clearTable(data);
    favoritesWidget.fillTable(data);
    moneyManager.updateUsersList(data);
}

let handler = (showFunc, errorBox, method, message) => data => method(data, response => {
    if (response.success) {
        showFunc(response.data);
        errorBox.setMessage(response.success, message);
    } else {
        errorBox.setMessage(response.success, response.error);
    }
});

moneyManager.addMoneyCallback = handler(ProfileWidget.showProfile, moneyManager, ApiConnector.addMoney, 'Баланс успешно пополнен!');
moneyManager.conversionMoneyCallback = handler(ProfileWidget.showProfile, moneyManager, ApiConnector.convertMoney, 'Конвертация успешно выполнена!');
moneyManager.sendMoneyCallback = handler(ProfileWidget.showProfile, moneyManager, ApiConnector.transferMoney, 'Перевод успешно выполнен');
favoritesWidget.addUserCallback = handler(updateFavorites, favoritesWidget, ApiConnector.addUserToFavorites, 'Пользователь успешно добавлен!');
favoritesWidget.removeUserCallback = handler(updateFavorites, favoritesWidget, ApiConnector.removeUserFromFavorites, 'Пользователь успешно удален!');