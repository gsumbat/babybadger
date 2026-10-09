// GENERATED from wireframe P6d-BookDrawer.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 9l6 6 6-6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 9l6 6 6-6\"></path></svg>",
  "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>"
];

/** Book a shift · drawer */
export default function WF_P6d() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ backgroundColor: "rgba(27,35,40,0.32)", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "column" }}>
      </View>
      <View style={{ flexDirection: "column", gap: 14, paddingTop: 20, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", flexShrink: 1 }}>Calendar</Text>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#4B5960", flexShrink: 1 }}>October 2026</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#4B5960" }}>Day</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6b-CalWeek.dc.html */}
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#1B2328" }}>Week</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> P6c-CalMonth.dc.html */}
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#4B5960" }}>Month</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 4 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "column", gap: 4, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#6B7980", textAlign: "center" }}>Mon</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 16, color: "#1B2328", textAlign: "center" }}>28</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 4, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#6B7980", textAlign: "center" }}>Tue</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 16, color: "#1B2328", textAlign: "center" }}>29</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 4, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#6B7980", textAlign: "center" }}>Wed</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 16, color: "#1B2328", textAlign: "center" }}>30</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 4, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#6B7980", textAlign: "center" }}>Thu</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 16, color: "#1B2328", textAlign: "center" }}>1</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 4, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#6B7980", textAlign: "center" }}>Fri</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 16, color: "#1B2328", textAlign: "center" }}>2</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 4, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, backgroundColor: "#47698A", borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#FFFFFF", textAlign: "center" }}>Sat</Text>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 16, color: "#FFFFFF", textAlign: "center" }}>3</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 4, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#6B7980", textAlign: "center" }}>Sun</Text>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 16, color: "#1B2328", textAlign: "center" }}>4</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, paddingTop: 0, paddingRight: 20, paddingBottom: 0, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Thu, Oct 1 · Maya</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>3:00 – 7:00 PM</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", height: 26, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Confirmed</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "column", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Fri, Oct 2 · Maya</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>3:00 – 7:00 PM</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", height: 26, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Confirmed</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, left: 0, right: 0, bottom: 0, paddingTop: 12, paddingRight: 20, paddingBottom: 32, paddingLeft: 20, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1.0, borderTopColor: "#E6EAEF", position: "absolute", ...cardShadow }}>
        <View style={{ alignSelf: "center", width: 40, height: 5, backgroundColor: "#C3CCD5", borderRadius: 3, flexDirection: "column" }}>
        </View>
        <View style={{ flexDirection: "column" }}>
          <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328" }}>Book a shift</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Sat, Oct 3</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 4, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 2.0, borderColor: "#47698A", flexShrink: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, backgroundColor: "#47698A", borderRadius: 15, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#FFFFFF" }}>M</Text>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Maya</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P42-Pool.dc.html */}
            <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A" }}>See who’s free</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 4 }}>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Thu</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>1</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Fri</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>2</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, backgroundColor: "#47698A", borderRadius: 14, borderWidth: 1.0, borderColor: "#47698A", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#FFFFFF" }}>Sat</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF", marginVertical: -3.62 }}>3</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Sun</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>4</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Mon</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>5</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Tue</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>6</Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 2, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74" }}>Wed</Text>
            <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62 }}>7</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flexDirection: "column", gap: 6, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Starts</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
              <Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}>3:00 PM</Text>
              <SvgXml xml={SVG[0]} width={18} height={18} />
            </View>
          </View>
          <View style={{ flexDirection: "column", gap: 6, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Ends</Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
              <Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}>7:00 PM</Text>
              <SvgXml xml={SVG[1]} width={18} height={18} />
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>KIDS</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
            <SvgXml xml={SVG[2]} width={14} height={14} />
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>Ava</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 36, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A", flexShrink: 1 }}>
            <SvgXml xml={SVG[3]} width={14} height={14} />
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>Leo</Text>
          </View>
        </View>
        <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", letterSpacing: 0.6 }}>FROM THEIR DAYS</Text>
        <View style={{ flexDirection: "column", gap: 6, paddingTop: 12, paddingRight: 14, paddingBottom: 12, paddingLeft: 14, backgroundColor: "#F3F5F8", borderRadius: 14 }}>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328" }}>3:15 PM · Pick up from school</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328" }}>4:30 PM · Soccer practice · Ava</Text>
          <Text style={{ fontFamily: font.body, fontSize: 15, color: "#1B2328" }}>6:00 PM · Dinner</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, marginTop: 2, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> P5b-BookedShift.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Book shift</Text>
        </View>
      </View>
    </View>
  );
}
