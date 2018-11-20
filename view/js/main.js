let sidebar_location = 0;
let sidebar_choices = [{name: 'Account Stats',component: 'acc-stats'},
                      {name: 'Loot Tracker', component: 'loot-tracker'},
                      {name: 'High Alch Tables', component: 'high-alch-tables'},
                      {name: 'Grand Exchange', component: 'grand-e'}];

var {ipcRenderer, remote} = require('electron');
const osrs = remote.getGlobal("osrs");



// components relating to the stats display
Vue.component('stat-container', {
  props: {
    stats: Object
  },
  template: `<div style="width:100%" class="pure-g pure-u-5-5">
    <table style="width:100%" class="pure-table pure-table-striped">
      <thead style="width:100%">
        <tr style="width:100%">
            <th style="width:25%">Skill</th>
            <th style="width:25%">Level</th>
            <th style="width:25%">Rank</th>
            <th style="width:25%">XP</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item,key) in stats['Skills']">
          <td>{{key}}</td>
          <td>{{item.level}}</td>
          <td>{{item.rank}}</td>
          <td>{{item.xp}}</td>
        </tr>
      </tbody>
    </table>
  </div>`,
});

Vue.component('acc-stats', {
  template: `<div><form class="pure-form" @submit.prevent><input v-model.lazy.trim="name"></input>
    <select v-model.lazy="type">
      <option value="normal">Normal</option>
      <option value="ironman">Ironman</option>
      <option value="hardcore">Hardcore Ironman</option>
      <option value="ultimate">Ultimate Ironman</option>
      <option value="deadman">Deadman</option>
      <option value="seasonal">Deadman Seasonal</option>
    </select>
  </form>
    <stat-container v-if="stats" :stats="stats"></stat-container>
    </div>`,
  data: function(){
    return {name: "",stats: {},type: "normal"}
  },
  watch: {
    name: function(val){
      if(val){
        osrs.hiscores.getPlayer(val,this.type)
          .then(player => {
              this.$set(this,"stats",player);
          }).catch(()=>{alert(`No highscores for ${val} in ${this.type}`)});
      }
    },
    type: function(val){
      if(this.name){
        osrs.hiscores.getPlayer(this.name,val)
          .then(player => {
              this.$set(this,"stats",player);
          }).catch(()=>{alert(`No highscores for ${this.name} in ${val}`)});
      }
    }
  }
});



Vue.component('loot-tracker', {
  template: `<div></div>`
});

Vue.component('high-alch-tables', {
  template: `<div></div>`
});


Vue.component('grand-e',{
  template: `<div><form class="pure-form" @submit.prevent>
    <input v-model.lazy.trim="item">
  </form><button @click="requestEx">A</button></div>`,
  data: ()=>{
    return {item: ""}
  },
  watch:{
    item: function(val){
      osrs.ge.getItems([this.item]).then(items => {console.log(JSON.parse(items));})
    }
  },
  methods:{
    requestEx: ()=>{
      ipcRenderer.send("requestExchangeItemData");
    }
  }
});

/*
  MAIN sections
*/

Vue.component('sidebar-controller', {
  props: ['choices'],
  template: `
  <ul class="pure-menu-list">
    <li v-for="(item,key) in choices" class="pure-menu-item" @click="$set($root,'sidebar_location',key)" :class="{'pure-menu-selected':key == $root.sidebar_location}">
      <a class="pure-menu-link" href="#">{{item.name}}</a>
    </li>
  </ul>`
});

Vue.component('content-area', {
  props: ['selectedmenu'],
  template: `
    <div>
      <div class="pad overflow">
        <div><h1 class="text-right pad no-margin">{{$root.sidebar_choices[selectedmenu].name}}</h1></div>
        <component :is="$root.sidebar_choices[selectedmenu].component"></component>
      </div>
    </div>
  `
});

window.addEventListener('load', function() {
    new Vue({ el: '#main',
      data: {
        sidebar_choices: sidebar_choices,
        sidebar_location: sidebar_location
      }
   });
})
