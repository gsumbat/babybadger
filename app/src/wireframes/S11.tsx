// GENERATED from wireframe S11-Availability.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>"
];

/** Availability */
export default function WF_S11() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> S6-Calendar.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", flexShrink: 1 }}>Availability</Text>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <Text style={{ fontFamily: font.body, fontSize: 15, color: "#4B5960", lineHeight: 22 }}>Families can request shifts only inside these hours. Booked shifts block the time for everyone else.</Text>
        <View style={{ flexDirection: "column", paddingTop: 4, paddingRight: 16, paddingBottom: 4, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 48, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Mon</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>2:30 – 10:00 PM</Text>
            <View style={{ width: 50, height: 30, backgroundColor: "#47698A", borderRadius: 15, flexShrink: 1, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 48, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Tue</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>2:30 – 10:00 PM</Text>
            <View style={{ width: 50, height: 30, backgroundColor: "#47698A", borderRadius: 15, flexShrink: 1, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 48, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Wed</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#5F6D74", flexGrow: 1, flexShrink: 1 }}>Unavailable (class)</Text>
            <View style={{ width: 50, height: 30, backgroundColor: "#C3CCD5", borderRadius: 15, flexShrink: 1, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, left: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 48, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Thu</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>2:30 – 10:00 PM</Text>
            <View style={{ width: 50, height: 30, backgroundColor: "#47698A", borderRadius: 15, flexShrink: 1, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 48, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Fri</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>2:30 – 11:00 PM</Text>
            <View style={{ width: 50, height: 30, backgroundColor: "#47698A", borderRadius: 15, flexShrink: 1, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ width: 48, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Sat</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>10:00 AM – 11:00 PM</Text>
            <View style={{ width: 50, height: 30, backgroundColor: "#47698A", borderRadius: 15, flexShrink: 1, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, right: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 56 }}>
            <View style={{ width: 48, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Sun</Text></View>
            <Text style={{ fontFamily: font.body, fontSize: 15, color: "#5F6D74", flexGrow: 1, flexShrink: 1 }}>Unavailable</Text>
            <View style={{ width: 50, height: 30, backgroundColor: "#C3CCD5", borderRadius: 15, flexShrink: 1, flexDirection: "column" }}>
              <View style={{ width: 24, height: 24, top: 3, left: 3, backgroundColor: "#FFFFFF", borderRadius: 12, position: "absolute", flexDirection: "column" }}>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Time off</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#5F6D74" }}>Oct 16 – 18 · requests auto-declined</Text>
          </View>
          <View style={{ height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1, justifyContent: "center" }}><Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A" }}>+ Add</Text></View>
        </View>
        <View style={{ paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 12 }}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#34526E", lineHeight: 20 }}>Families see only "available" or "unavailable". They never see which family booked you.</Text></View>
      </View>
      <View style={{ paddingTop: 8, paddingRight: 20, paddingBottom: 32, paddingLeft: 20, flexDirection: "column" }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", height: 54, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> S6-Calendar.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Save availability</Text>
        </View>
      </View>
    </View>
  );
}
