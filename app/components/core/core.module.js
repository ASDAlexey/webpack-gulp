import Menu from '../menu';
//console.log(Menu);
var pandaMenu = new Menu({
    title: "Меню панды!!!",
    items: [{
        text: 'Яйца',
        href: '#eggs'
    }, {
        text: 'Мясо',
        href: '#meat'
    }, {
        text: '99% еды - бамбук!',
        href: '#bamboo'
    }]
});
//core = {
//    pandaMenu: pandaMenu
//};
let core=pandaMenu;

export default core;
