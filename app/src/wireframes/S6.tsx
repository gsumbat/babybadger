// GENERATED from wireframe S6-Calendar.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 2.6; stroke-linecap: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>"
];

/** Sitter calendar · Week */
export default function WF_S6() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "column", gap: 12, paddingTop: 20, paddingRight: 20, paddingBottom: 10, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", flexShrink: 1 }}>Calendar</Text>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 40, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, backgroundColor: "#DCE7F1", borderRadius: 999, flexShrink: 1 }}>{/* -> S11-Availability.dc.html */}
            <SvgXml xml={SVG[0]} width={16} height={16} />
            <Text style={{ fontFamily: font.displayBold, fontSize: 15, color: "#47698A" }}>Time off</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#E8ECF1", borderRadius: 12 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#4B5960" }}>Day</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6-Calendar.dc.html */}
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#1B2328" }}>Week</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6c-CalMonth.dc.html */}
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#4B5960" }}>Month</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <SvgXml xml={SVG[1]} width={18} height={18} />
          </View>
          <View style={{ flexDirection: "column", alignItems: "center", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328", marginVertical: -3.42 }}>Sep 28 – Oct 4</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>This week · 6 shifts · 2 families</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <SvgXml xml={SVG[2]} width={18} height={18} />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 7, minHeight: 0, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "column", gap: 2, paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", gap: 2 }}>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>Mon</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62, textAlign: "center" }}>28</Text>
              <View style={{ flexDirection: "row", gap: 3, height: 6 }}>
                <View style={{ width: 6, height: 6, backgroundColor: "#2F6FD6", borderRadius: 3, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>Tue</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62, textAlign: "center" }}>29</Text>
              <View style={{ flexDirection: "row", gap: 3, height: 6 }}>
                <View style={{ width: 6, height: 6, backgroundColor: "#D9822B", borderRadius: 3, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>Wed</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62, textAlign: "center" }}>30</Text>
              <View style={{ flexDirection: "row", gap: 3, height: 6 }}>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, backgroundColor: "#47698A", borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#FFFFFF", textAlign: "center" }}>Thu</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF", marginVertical: -3.62, textAlign: "center" }}>1</Text>
              <View style={{ flexDirection: "row", gap: 3, height: 6 }}>
                <View style={{ width: 6, height: 6, backgroundColor: "#2F6FD6", borderRadius: 3, flexShrink: 1, flexDirection: "column", ...cardShadow }}>
                </View>
                <View style={{ width: 6, height: 6, backgroundColor: "#D9822B", borderRadius: 3, flexShrink: 1, flexDirection: "column", ...cardShadow }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>Fri</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62, textAlign: "center" }}>2</Text>
              <View style={{ flexDirection: "row", gap: 3, height: 6 }}>
                <View style={{ width: 6, height: 6, backgroundColor: "#2F6FD6", borderRadius: 3, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>Sat</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62, textAlign: "center" }}>3</Text>
              <View style={{ flexDirection: "row", gap: 3, height: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: "#B7791F", flexShrink: 1, flexDirection: "column" }}>
                </View>
                <View style={{ width: 6, height: 6, backgroundColor: "#D9822B", borderRadius: 3, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", gap: 3, paddingTop: 6, paddingRight: 0, paddingBottom: 6, paddingLeft: 0, borderRadius: 12, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "center" }}>Sun</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328", marginVertical: -3.62, textAlign: "center" }}>4</Text>
              <View style={{ flexDirection: "row", gap: 3, height: 6 }}>
                <View style={{ width: 10, height: 6, borderRadius: 2, flexShrink: 1, flexDirection: "column" }}>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "stretch", gap: 10 }}>
          <View style={{ flexDirection: "column", width: 40, flexShrink: 0 }}>
            <Text style={{ fontFamily: font.bodyMedium, fontSize: 12, color: "#5F6D74" }}>Mon</Text>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>28</Text>
          </View>
          <View style={{ flexDirection: "column", justifyContent: "center", gap: 5, flexGrow: 1, flexShrink: 1 }}>
            <View style={{ flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", overflow: "hidden", flexShrink: 1, minHeight: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <View style={{ width: 5, flexShrink: 0, backgroundColor: "#2F6FD6", flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexGrow: 1, paddingTop: 7, paddingRight: 12, paddingBottom: 7, paddingLeft: 12, flexShrink: 1 }}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Lee · 3–7 PM</Text>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Hours approved</Text>
                </View>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
                  <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                  </View>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Done</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "stretch", gap: 10 }}>
          <View style={{ flexDirection: "column", width: 40, flexShrink: 0 }}>
            <Text style={{ fontFamily: font.bodyMedium, fontSize: 12, color: "#5F6D74" }}>Tue</Text>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>29</Text>
          </View>
          <View style={{ flexDirection: "column", justifyContent: "center", gap: 5, flexGrow: 1, flexShrink: 1 }}>
            <View style={{ flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", overflow: "hidden", flexShrink: 1, minHeight: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <View style={{ width: 5, flexShrink: 0, backgroundColor: "#D9822B", flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexGrow: 1, paddingTop: 7, paddingRight: 12, paddingBottom: 7, paddingLeft: 12, flexShrink: 1 }}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Ortiz · 7:30–10 PM</Text>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Waiting for approval</Text>
                </View>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#E8ECF1", borderRadius: 999 }}>
                  <View style={{ width: 7, height: 7, backgroundColor: "#8A979D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                  </View>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#4B5960" }}>Done</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "stretch", gap: 10 }}>
          <View style={{ flexDirection: "column", width: 40, flexShrink: 0 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#47698A" }}>Thu</Text>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#47698A", marginVertical: -4.02 }}>1</Text>
          </View>
          <View style={{ flexDirection: "column", justifyContent: "center", gap: 5, flexGrow: 1, flexShrink: 1 }}>
            <View style={{ flexDirection: "row", backgroundColor: "#D9E5FA", borderRadius: 14, borderWidth: 2.0, borderColor: "#2F6FD6", overflow: "hidden", flexShrink: 1, minHeight: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <View style={{ width: 5, flexShrink: 0, backgroundColor: "#2F6FD6", flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexGrow: 1, paddingTop: 7, paddingRight: 12, paddingBottom: 7, paddingLeft: 12, flexShrink: 1 }}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Lee · 3–7 PM</Text>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Pickup 3:15 · soccer</Text>
                </View>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCE7F1", borderRadius: 999 }}>
                  <View style={{ width: 7, height: 7, backgroundColor: "#47698A", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                  </View>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E" }}>Next</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", overflow: "hidden", flexShrink: 1, minHeight: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <View style={{ width: 5, flexShrink: 0, backgroundColor: "#D9822B", flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexGrow: 1, paddingTop: 7, paddingRight: 12, paddingBottom: 7, paddingLeft: 12, flexShrink: 1 }}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Ortiz · 7:30–10 PM</Text>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>30 min to get there</Text>
                </View>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
                  <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                  </View>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Confirmed</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "stretch", gap: 10 }}>
          <View style={{ flexDirection: "column", width: 40, flexShrink: 0 }}>
            <Text style={{ fontFamily: font.bodyMedium, fontSize: 12, color: "#5F6D74" }}>Fri</Text>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>2</Text>
          </View>
          <View style={{ flexDirection: "column", justifyContent: "center", gap: 5, flexGrow: 1, flexShrink: 1 }}>
            <View style={{ flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", overflow: "hidden", flexShrink: 1, minHeight: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <View style={{ width: 5, flexShrink: 0, backgroundColor: "#2F6FD6", flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexGrow: 1, paddingTop: 7, paddingRight: 12, paddingBottom: 7, paddingLeft: 12, flexShrink: 1 }}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Lee · 3–7 PM</Text>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>After-school plan</Text>
                </View>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
                  <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                  </View>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Confirmed</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "stretch", gap: 10 }}>
          <View style={{ flexDirection: "column", width: 40, flexShrink: 0 }}>
            <Text style={{ fontFamily: font.bodyMedium, fontSize: 12, color: "#5F6D74" }}>Sat</Text>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>3</Text>
          </View>
          <View style={{ flexDirection: "column", justifyContent: "center", gap: 5, flexGrow: 1, flexShrink: 1 }}>
            <View style={{ flexDirection: "row", backgroundColor: "#F7ECED", borderRadius: 14, borderWidth: 1.5, borderColor: "#B7791F", borderStyle: "dashed" }}>{/* -> S20-ShiftRequest.dc.html */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexGrow: 1, paddingTop: 7, paddingRight: 12, paddingBottom: 7, paddingLeft: 12, flexShrink: 1 }}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Request · Lee · 6–7 PM</Text>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#7A4E0E" }}>Before your Ortiz shift · reply by Fri</Text>
                </View>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 28, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#47698A", borderRadius: 999, flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#FFFFFF" }}>Answer</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF", overflow: "hidden", flexShrink: 1, minHeight: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <View style={{ width: 5, flexShrink: 0, backgroundColor: "#D9822B", flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexGrow: 1, paddingTop: 7, paddingRight: 12, paddingBottom: 7, paddingLeft: 12, flexShrink: 1 }}>
                <View style={{ flexDirection: "column", flexShrink: 1 }}>
                  <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Ortiz · 7–10 PM</Text>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Bedtime for Sam</Text>
                </View>
                <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
                  <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                  </View>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Confirmed</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "stretch", gap: 10 }}>
          <View style={{ flexDirection: "column", width: 40, flexShrink: 0 }}>
            <Text style={{ fontFamily: font.bodyMedium, fontSize: 12, color: "#5F6D74" }}>Sun</Text>
            <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328", marginVertical: -4.02 }}>4</Text>
          </View>
          <View style={{ flexDirection: "column", justifyContent: "center", gap: 5, flexGrow: 1, flexShrink: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", height: 40, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, borderRadius: 14, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> S11-Availability.dc.html */}
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#4B5960" }}>Time off · all day</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 9, height: 9, backgroundColor: "#2F6FD6", borderRadius: 5, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Lee</Text>
          </View>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 9, height: 9, backgroundColor: "#D9822B", borderRadius: 5, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Ortiz</Text>
          </View>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, borderWidth: 2.0, borderColor: "#B7791F", flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Request</Text>
          </View>
          <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, flexShrink: 1 }}>
            <View style={{ width: 12, height: 9, borderRadius: 3, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Off</Text>
          </View>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
