// GENERATED from wireframe P9t-AlertsTrips.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 16v-3.5L6 7h12l2 5.5V16z\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #C2412D; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 3l9.5 17h-19z\"></path><path d=\"M12 10v4M12 17h0\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1F8A4D; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 16v-3.5L6 7h12l2 5.5V16z\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2.5 1-3.5 3.5-3.5 7.5h3.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1F8A4D; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M12 7v5l3 2\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z\"></path></svg>"
];

/** Alerts · Trips */
export default function WF_P9t() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P4-Live.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexShrink: 1 }}>Alerts</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 20, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>EARLIER TODAY</Text>
        <View style={{ flexDirection: "column", backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>{/* -> P8b-TripAsk.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 18 }}>
              <SvgXml xml={SVG[1]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Maya asked to go to the library</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>Ava and Leo · on foot · 5:55 PM</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F6DCD6", borderRadius: 18 }}>
              <SvgXml xml={SVG[2]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Off-plan location</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>Maya left Riverside soccer fields without starting a trip. She is 0.6 mi away, moving. · 5:42 PM</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCEEE3", borderRadius: 18 }}>
              <SvgXml xml={SVG[3]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Arrived at soccer</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>Maya and Ava · 4:27 PM</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 18 }}>
              <SvgXml xml={SVG[4]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Trip started to soccer</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>By car · 4:10 PM</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F3E1E3", borderRadius: 18 }}>
              <SvgXml xml={SVG[5]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Ava ate all of her snack</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>Apple slices, crackers · 3:34 PM</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCEEE3", borderRadius: 18 }}>
              <SvgXml xml={SVG[6]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Maya clocked in at home</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>3:02 PM</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 18 }}>
              <SvgXml xml={SVG[7]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Maya asked to clock in away from home</Text>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>2:55 PM</Text>
            </View>
          </View>
        </View>
        <View style={{ alignSelf: "center", paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A", textDecorationLine: "underline" }}>Choose which alerts you get</Text></View>
      </View>
    </View>
  );
}
