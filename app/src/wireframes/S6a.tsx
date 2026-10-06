// GENERATED from wireframe S6a-CalDay.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #47698A; stroke-width: 2.6; stroke-linecap: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M9 6l6 6-6 6\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 16v-4l2-5h12l2 5v4z\"></path><circle cx=\"7.5\" cy=\"16.5\" r=\"1.8\"></circle><circle cx=\"16.5\" cy=\"16.5\" r=\"1.8\"></circle></svg>"
];

/** Sitter calendar · Day */
export default function WF_S6a() {
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
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, backgroundColor: "#FFFFFF", borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6a-CalDay.dc.html */}
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#1B2328" }}>Day</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 38, borderRadius: 9, flexShrink: 1, flexGrow: 1, flexBasis: 0, minWidth: 0 }}>{/* -> S6-Calendar.dc.html */}
              <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: "#4B5960" }}>Week</Text>
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
            <Text style={{ fontFamily: font.displayBold, fontSize: 18, color: "#1B2328", marginVertical: -3.42 }}>Today</Text>
            <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Thursday, October 1 · 6.5 hrs booked</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 40, height: 40, backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>
            <SvgXml xml={SVG[2]} width={18} height={18} />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 10, minHeight: 0, flexGrow: 1, paddingTop: 6, paddingRight: 20, paddingBottom: 0, paddingLeft: 20 }}>
        <View style={{ height: 422, marginTop: 10, flexDirection: "column" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, top: 0, left: 0, right: 0, position: "absolute" }}>
            <View style={{ width: 40, marginTop: -8, flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "right" }}>2 PM</Text></View>
            <View style={{ height: 1, flexGrow: 1, backgroundColor: "#DDE3EA", flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, top: 52, left: 0, right: 0, position: "absolute" }}>
            <View style={{ width: 40, marginTop: -8, flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "right" }}>3 PM</Text></View>
            <View style={{ height: 1, flexGrow: 1, backgroundColor: "#DDE3EA", flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, top: 104, left: 0, right: 0, position: "absolute" }}>
            <View style={{ width: 40, marginTop: -8, flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "right" }}>4 PM</Text></View>
            <View style={{ height: 1, flexGrow: 1, backgroundColor: "#DDE3EA", flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, top: 156, left: 0, right: 0, position: "absolute" }}>
            <View style={{ width: 40, marginTop: -8, flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "right" }}>5 PM</Text></View>
            <View style={{ height: 1, flexGrow: 1, backgroundColor: "#DDE3EA", flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, top: 208, left: 0, right: 0, position: "absolute" }}>
            <View style={{ width: 40, marginTop: -8, flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "right" }}>6 PM</Text></View>
            <View style={{ height: 1, flexGrow: 1, backgroundColor: "#DDE3EA", flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, top: 260, left: 0, right: 0, position: "absolute" }}>
            <View style={{ width: 40, marginTop: -8, flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "right" }}>7 PM</Text></View>
            <View style={{ height: 1, flexGrow: 1, backgroundColor: "#DDE3EA", flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, top: 312, left: 0, right: 0, position: "absolute" }}>
            <View style={{ width: 40, marginTop: -8, flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "right" }}>8 PM</Text></View>
            <View style={{ height: 1, flexGrow: 1, backgroundColor: "#DDE3EA", flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, top: 364, left: 0, right: 0, position: "absolute" }}>
            <View style={{ width: 40, marginTop: -8, flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "right" }}>9 PM</Text></View>
            <View style={{ height: 1, flexGrow: 1, backgroundColor: "#DDE3EA", flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, top: 416, left: 0, right: 0, position: "absolute" }}>
            <View style={{ width: 40, marginTop: -8, flexShrink: 1 }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#5F6D74", textAlign: "right" }}>10 PM</Text></View>
            <View style={{ height: 1, flexGrow: 1, backgroundColor: "#DDE3EA", flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
          <View style={{ height: 206, top: 52, left: 52, right: 0, backgroundColor: "#D9E5FA", borderRadius: 16, borderWidth: 2.0, borderColor: "#2F6FD6", position: "absolute", overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>{/* -> S3-Today.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8, paddingRight: 12, paddingBottom: 8, paddingLeft: 12 }}>
              <View style={{ flexDirection: "column", flexShrink: 1 }}>
                <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#1B2328", marginVertical: -2.82 }}>Lee · 3:00 – 7:00 PM</Text>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#1F4E9A" }}>Ava and Leo · [RATE]/hr</Text>
              </View>
              <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCE7F1", borderRadius: 999 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#47698A", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#34526E" }}>Next</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, top: 58, left: 12, right: 12, position: "absolute" }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328", flexShrink: 1 }}>3:15 Pick up Ava</Text>
              <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 20, paddingTop: 0, paddingRight: 7, paddingBottom: 0, paddingLeft: 7, backgroundColor: "#FFFFFF", borderRadius: 999, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#47698A" }}>Trip</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, top: 102, left: 12, right: 12, position: "absolute" }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328", flexShrink: 1 }}>4:10 Leave for soccer</Text>
              <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 20, paddingTop: 0, paddingRight: 7, paddingBottom: 0, paddingLeft: 7, backgroundColor: "#FFFFFF", borderRadius: 999, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#47698A" }}>Trip</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, top: 152, left: 12, right: 12, position: "absolute" }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, flexShrink: 1, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328", flexShrink: 1 }}>6:00 Dinner</Text>
              <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", height: 20, paddingTop: 0, paddingRight: 7, paddingBottom: 0, paddingLeft: 7, backgroundColor: "#F3E1E3", borderRadius: 999, flexShrink: 1 }}>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#1B2328" }}>Food</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, top: 260, left: 52, right: 0, paddingLeft: 12, position: "absolute" }}>
            <SvgXml xml={SVG[3]} width={16} height={16} />
            <Text style={{ fontFamily: font.bodySemi, fontSize: 12, color: "#4B5960" }}>30 min · 4.2 mi to the Ortiz home</Text>
          </View>
          <View style={{ height: 128, top: 286, left: 52, right: 0, backgroundColor: "#F9D9B5", borderRadius: 16, borderWidth: 1.5, borderColor: "#D9822B", position: "absolute", overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>{/* -> S10-Family.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 8, paddingRight: 12, paddingBottom: 8, paddingLeft: 12 }}>
              <View style={{ flexDirection: "column", flexShrink: 1 }}>
                <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#1B2328", marginVertical: -2.82 }}>Ortiz · 7:30 – 10:00 PM</Text>
                <Text style={{ fontFamily: font.body, fontSize: 12, color: "#8A4A12" }}>Sam · bedtime routine</Text>
              </View>
              <View style={{ flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
                <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
                </View>
                <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Confirmed</Text>
              </View>
            </View>
            <View style={{ paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12 }}><Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>Clock-in opens 7:15 PM at their door</Text></View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", top: 35, left: 44, right: 0, position: "absolute" }}>
            <View style={{ width: 10, height: 10, backgroundColor: "#C2412D", borderRadius: 5, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <View style={{ height: 2, flexGrow: 1, backgroundColor: "#C2412D", flexShrink: 1, flexDirection: "column" }}>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", flexShrink: 1 }}>Earned today · [AMOUNT]</Text>
          <View style={{ flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#47698A", textDecorationLine: "underline" }}>Hours and pay ›</Text></View>
        </View>
      </View>
      {/* tab bar: drawn by the app's tab navigator */}
    </View>
  );
}
