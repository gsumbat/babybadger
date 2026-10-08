// GENERATED from wireframe P6bh-CalWeekHelper.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Calendar · week · family helper */
export default function WF_P6bh() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 12, paddingTop: 20, paddingRight: 20, paddingBottom: 10, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", flexShrink: 1 }}>Calendar</Text>
          <View style={{ height: 40, flexShrink: 1, flexDirection: "column" }}>
          </View>
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <SvgXml xml={SVG[0]} width={18} height={18} />
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328", marginVertical: -3.42 }}>Sep 28 – Oct 4</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>This week · 3 shifts booked</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <SvgXml xml={SVG[1]} width={18} height={18} />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 8, minHeight: 0, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 2, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", gap: 2 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>Mon</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62, textAlign: "center" }}>28</Text>
              <View style={{ width: 6, height: 6, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>Tue</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62, textAlign: "center" }}>29</Text>
              <View style={{ width: 6, height: 6, backgroundColor: "transparent", borderRadius: 3, flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>Wed</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62, textAlign: "center" }}>30</Text>
              <View style={{ width: 6, height: 6, backgroundColor: "transparent", borderRadius: 3, flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, backgroundColor: "#47698A", borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#FFFFFF", textAlign: "center" }}>Thu</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF", marginVertical: -3.62, textAlign: "center" }}>1</Text>
              <View style={{ width: 6, height: 6, backgroundColor: "#FFFFFF", borderRadius: 3, flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>Fri</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62, textAlign: "center" }}>2</Text>
              <View style={{ width: 6, height: 6, backgroundColor: "#47698A", borderRadius: 3, flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>Sat</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62, textAlign: "center" }}>3</Text>
              <View style={{ width: 6, height: 6, backgroundColor: "#B7791F", borderRadius: 3, flexDirection: "column" }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>Sun</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62, textAlign: "center" }}>4</Text>
              <View style={{ width: 6, height: 6, backgroundColor: "transparent", borderRadius: 3, flexDirection: "column" }}>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "stretch", gap: 10, minHeight: 52 }}>
          <View style={{ flexDirection: "column", width: 56, flexShrink: 0 }}>
            <Text style={{ fontFamily: font.bodyMedium, fontSize: 12, color: "#5F6D74" }}>Mon</Text>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>28</Text>
          </View>
          <View style={{ flexDirection: "column", justifyContent: "center", gap: 6, flexGrow: 1, flexShrink: 1 }}>
            <View style={{ flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", overflow: "hidden", flexShrink: 1, minHeight: 0 }}>
              <View style={{ width: 5, flexShrink: 0, backgroundColor: "#47698A", flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexGrow: 1, paddingTop: 8, paddingRight: 12, paddingBottom: 8, paddingLeft: 12, flexShrink: 1 }}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Maya · 3:00 – 7:00 PM</Text>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Report ready</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", height: 22, paddingTop: 0, paddingRight: 8, paddingBottom: 0, paddingLeft: 8, backgroundColor: "#E8ECF1", borderRadius: 999, flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#4B5960" }}>Done</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "stretch", gap: 10, minHeight: 52 }}>
          <View style={{ flexDirection: "column", width: 56, flexShrink: 0 }}>
            <Text style={{ fontFamily: font.bodyMedium, fontSize: 12, color: "#5F6D74" }}>Tue</Text>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>29</Text>
          </View>
          <View style={{ flexDirection: "column", justifyContent: "center", gap: 6, flexGrow: 1, flexShrink: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, borderRadius: 14, borderWidth: 1.5, borderColor: "#C3CCD5", borderStyle: "dashed" }}>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>No sitter</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "stretch", gap: 10, minHeight: 52 }}>
          <View style={{ flexDirection: "column", width: 56, flexShrink: 0 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#47698A" }}>Thu</Text>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#47698A", marginVertical: -4.02 }}>1</Text>
          </View>
          <View style={{ flexDirection: "column", justifyContent: "center", gap: 6, flexGrow: 1, flexShrink: 1 }}>
            <View style={{ flexDirection: "row", backgroundColor: "#DCE7F1", borderRadius: 14, borderWidth: 2.0, borderColor: "#47698A", overflow: "hidden", flexShrink: 1, minHeight: 0 }}>
              <View style={{ width: 5, flexShrink: 0, backgroundColor: "#47698A", flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexGrow: 1, paddingTop: 8, paddingRight: 12, paddingBottom: 8, paddingLeft: 12, flexShrink: 1 }}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Maya · 3:00 – 7:00 PM</Text>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Ava and Leo · soccer 4:30</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", height: 22, paddingTop: 0, paddingRight: 8, paddingBottom: 0, paddingLeft: 8, backgroundColor: "#DCEEE3", borderRadius: 999, flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#1B6B3D" }}>On shift</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "stretch", gap: 10, minHeight: 52 }}>
          <View style={{ flexDirection: "column", width: 56, flexShrink: 0 }}>
            <Text style={{ fontFamily: font.bodyMedium, fontSize: 12, color: "#5F6D74" }}>Fri</Text>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>2</Text>
          </View>
          <View style={{ flexDirection: "column", justifyContent: "center", gap: 6, flexGrow: 1, flexShrink: 1 }}>
            <View style={{ flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", overflow: "hidden", flexShrink: 1, minHeight: 0 }}>
              <View style={{ width: 5, flexShrink: 0, backgroundColor: "#47698A", flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexGrow: 1, paddingTop: 8, paddingRight: 12, paddingBottom: 8, paddingLeft: 12, flexShrink: 1 }}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Maya · 3:00 – 7:00 PM</Text>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>After-school plan</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", height: 22, paddingTop: 0, paddingRight: 8, paddingBottom: 0, paddingLeft: 8, backgroundColor: "#DCEEE3", borderRadius: 999, flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#1B6B3D" }}>Confirmed</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "stretch", gap: 10, minHeight: 52 }}>
          <View style={{ flexDirection: "column", width: 56, flexShrink: 0 }}>
            <Text style={{ fontFamily: font.bodyMedium, fontSize: 12, color: "#5F6D74" }}>Sat</Text>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>3</Text>
          </View>
          <View style={{ flexDirection: "column", justifyContent: "center", gap: 6, flexGrow: 1, flexShrink: 1 }}>
            <View style={{ flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", overflow: "hidden", flexShrink: 1, minHeight: 0 }}>
              <View style={{ width: 5, flexShrink: 0, backgroundColor: "#B7791F", flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexGrow: 1, paddingTop: 8, paddingRight: 12, paddingBottom: 8, paddingLeft: 12, flexShrink: 1 }}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Maya · 6:00 – 7:00 PM</Text>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Request sent 3:58 PM</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", height: 22, paddingTop: 0, paddingRight: 8, paddingBottom: 0, paddingLeft: 8, backgroundColor: "#F6E3C6", borderRadius: 999, flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#7A4E0E" }}>Waiting</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "stretch", gap: 10, minHeight: 52 }}>
          <View style={{ flexDirection: "column", width: 56, flexShrink: 0 }}>
            <Text style={{ fontFamily: font.bodyMedium, fontSize: 12, color: "#5F6D74" }}>Sun</Text>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>4</Text>
          </View>
          <View style={{ flexDirection: "column", justifyContent: "center", gap: 6, flexGrow: 1, flexShrink: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, borderRadius: 14, borderWidth: 1.5, borderColor: "#C3CCD5", borderStyle: "dashed" }}>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>No sitter</Text>
            </View>
          </View>
        </View>
        <View style={{}}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>Wed 30 hidden: no plans</Text></View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
