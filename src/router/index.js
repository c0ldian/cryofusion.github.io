import { createRouter, createWebHashHistory } from 'vue-router'
import ShortCircuit from '../pages/ShortCircuitTest.vue'
import ShortCircuitCurrent from '../pages/ShortCircuitCurrent.vue'
import OverCurrent from '../pages/OverCurrent.vue'
import DistanceIndex from '../pages/distance/index.vue'
import PhaseDistance from '../pages/distance/PhaseDistance.vue'
import DirectionalDistance from '../pages/distance/DirectionalDistance.vue'
import Differential from '../pages/Differential.vue'
import CtRatio from '../pages/CtRatio.vue'
import PtRatio from '../pages/PtRatio.vue'
import RecloseTime from '../pages/RecloseTime.vue'
import Sensitivity from '../pages/Sensitivity.vue'
import Home from '../pages/Home.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/calculators/short-circuit', name: 'ShortCircuit', component: ShortCircuit },
  { path: '/calculators/short-circuit-current', name: 'ShortCircuitCurrent', component: ShortCircuitCurrent },
  { path: '/calculators/distance', name: 'DistanceIndex', component: DistanceIndex },
  { path: '/calculators/distance/phase', name: 'PhaseDistance', component: PhaseDistance },
  { path: '/calculators/distance/directional', name: 'DirectionalDistance', component: DirectionalDistance },
  { path: '/calculators/differential', name: 'Differential', component: Differential },
  { path: '/calculators/over-current', name: 'OverCurrent', component: OverCurrent },
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