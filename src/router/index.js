import { createRouter, createWebHashHistory } from 'vue-router'
import ShortCircuit from '../pages/ShortCircuit.vue'
import OverCurrent from '../pages/OverCurrent.vue'
import Distance from '../pages/Distance.vue'
import Differential from '../pages/Differential.vue'
import CtRatio from '../pages/CtRatio.vue'
import PtRatio from '../pages/PtRatio.vue'
import RecloseTime from '../pages/RecloseTime.vue'
import Sensitivity from '../pages/Sensitivity.vue'
import Home from '../pages/Home.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/calculators/short-circuit', name: 'ShortCircuit', component: ShortCircuit },
  { path: '/calculators/over-current', name: 'OverCurrent', component: OverCurrent },
  { path: '/calculators/distance', name: 'Distance', component: Distance },
  { path: '/calculators/differential', name: 'Differential', component: Differential },
  { path: '/calculators/ct-ratio', name: 'CtRatio', component: CtRatio },
  { path: '/calculators/pt-ratio', name: 'PtRatio', component: PtRatio },
  { path: '/calculators/reclose-time', name: 'RecloseTime', component: RecloseTime },
  { path: '/calculators/sensitivity', name: 'Sensitivity', component: Sensitivity },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router