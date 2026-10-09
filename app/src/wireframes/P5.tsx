// GENERATED from wireframe P5-Report.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"350\" height=\"130\" viewBox=\"0 0 350 130\"><rect x=\"230\" y=\"10\" width=\"90\" height=\"50\" rx=\"8\" style=\"fill: #D7EAD9\"></rect><path d=\"M0 45H350M0 100H350M120 0V130M250 0V130\" style=\"stroke: #FFFFFF; stroke-width: 8; fill: none\"></path><path d=\"M50 110 C90 100 120 70 170 70 S 250 40 280 35\" style=\"fill: none; stroke: #47698A; stroke-width: 3.5; stroke-linecap: round\"></path><rect x=\"42\" y=\"102\" width=\"16\" height=\"16\" rx=\"4\" style=\"fill: #FFFFFF; stroke: #1B2328; stroke-width: 2\"></rect><circle cx=\"280\" cy=\"35\" r=\"8\" style=\"fill: #E8B9BE; stroke: #FFFFFF; stroke-width: 3\"></circle></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #34526E; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M5 12.5l4.5 4.5L19 7.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #6A5A9E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><circle cx=\"12\" cy=\"12\" r=\"9\"></circle><path d=\"M10 8.5l5 3.5-5 3.5z\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #6A5A9E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #7A4E0E; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 3v7a2 2 0 0 0 4 0V3M8 10v11M17 21V3c-2.5 1-3.5 3.5-3.5 7.5h3.5\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 16v-3.5L6 7h12l2 5.5V16zM4 16v2.5M20 16v2.5M7.5 13h0M16.5 13h0\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #8A5A7A; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #8A5A7A; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path></svg>",
  "<svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #8A5A7A; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z\"></path></svg>"
];

/** Shift report */
export default function WF_P5() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF", flexShrink: 1 }}>{/* -> P4d-HomeEnded.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "column", flexShrink: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 20, color: "#1B2328" }}>Shift report</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960" }}>Maya · Thu, Oct 1</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 0, paddingRight: 20, paddingBottom: 20, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", gap: 8, flexShrink: 0, paddingTop: 0, paddingRight: 20, paddingBottom: 0, paddingLeft: 20, marginRight: -20, marginLeft: -20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A" }}>
            <SvgXml xml={SVG[1]} width={14} height={14} />
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#34526E" }}>All</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P5k-AvaReport.dc.html */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 20, height: 20, flexShrink: 0, backgroundColor: "#E8B9BE", borderRadius: 10 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 9, color: "#8A3F5A" }}>A</Text>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Ava</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 20, height: 20, flexShrink: 0, backgroundColor: "#2F6FD6", borderRadius: 10 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 9, color: "#FFFFFF" }}>L</Text>
            </View>
            <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Leo</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 12, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, backgroundColor: "#47698A", borderRadius: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#FFFFFF", opacity: 0.8 }}>Time worked</Text>
              <Text style={{ fontFamily: font.display, fontSize: 32, color: "#FFFFFF", marginVertical: -6.63 }}>4 h 02 m</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "flex-end", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.body, fontSize: 13, color: "#FFFFFF", opacity: 0.8 }}>3:02 – 7:04 PM</Text>
              <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>[TOTAL PAY]</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 48, backgroundColor: "#FFFFFF", borderRadius: 999 }}>{/* -> P33-InvoicePay.dc.html */}
            <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#47698A" }}>Approve hours</Text>
          </View>
        </View>
        <View style={{ height: 130, backgroundColor: "#E7EDEB", borderRadius: 20, borderWidth: 1.0, borderColor: "#E6EAEF", overflow: "hidden", flexShrink: 1, minHeight: 0, flexDirection: "column" }}>
          <SvgXml xml={SVG[2]} width={350} height={130} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 36, right: 10, bottom: 10, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 10, position: "absolute" }}>{/* -> P8-Trip.dc.html */}
            <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#47698A" }}>Replay route</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Tasks</Text>
            <View style={{ flexDirection: "row", alignItems: "center", height: 24, paddingTop: 0, paddingRight: 8, paddingBottom: 0, paddingLeft: 8, backgroundColor: "#DCEEE3", borderRadius: 999, flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>4 of 4 done</Text>
            </View>
          </View>
          <View style={{}}><Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", lineHeight: 20 }}>Pick up Ava · Snack · Soccer at 4:30 · Dinner</Text></View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 2, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Logs</Text>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", flexShrink: 1 }}>8</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 6, paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, marginRight: -16, marginLeft: -16, overflow: "hidden", flexShrink: 1, minHeight: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#DCE7F1", borderRadius: 999, borderWidth: 1.5, borderColor: "#47698A" }}>
              <SvgXml xml={SVG[3]} width={16} height={16} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#34526E" }}>All</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Food</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Sleep</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 40, flexShrink: 0, paddingTop: 0, paddingRight: 12, paddingBottom: 0, paddingLeft: 12, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.0, borderColor: "#E6EAEF" }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 13, color: "#1B2328" }}>Activities</Text>
            </View>
          </View>
          <View style={{ marginTop: 2, flexDirection: "column" }}>
            <View style={{ flexDirection: "row", gap: 12, paddingBottom: 12 }}>
              <View style={{ width: 2, top: 38, left: 17, bottom: -6, backgroundColor: "#E6EAEF", position: "absolute", flexShrink: 1, flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#ECE7F5", borderRadius: 18 }}>
                <SvgXml xml={SVG[4]} width={18} height={18} />
              </View>
              <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Nap ended</Text>
                  <View style={{ paddingTop: 2, paddingRight: 7, paddingBottom: 2, paddingLeft: 7, backgroundColor: "#E8ECF1", borderRadius: 999, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#4B5960" }}>Leo</Text></View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", marginLeft: "auto", flexShrink: 1 }}>5:10</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>1 h 25 min · fell asleep easily</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 12, paddingBottom: 12 }}>
              <View style={{ width: 2, top: 38, left: 17, bottom: -6, backgroundColor: "#E6EAEF", position: "absolute", flexShrink: 1, flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 18 }}>
                <SvgXml xml={SVG[5]} width={18} height={18} />
              </View>
              <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Park</Text>
                  <View style={{ paddingTop: 2, paddingRight: 7, paddingBottom: 2, paddingLeft: 7, backgroundColor: "#E8ECF1", borderRadius: 999, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#4B5960" }}>Both</Text></View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", marginLeft: "auto", flexShrink: 1 }}>4:30</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>1 h · Leo found a frog and named it Pickles</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 12, paddingBottom: 12 }}>
              <View style={{ width: 2, top: 38, left: 17, bottom: -6, backgroundColor: "#E6EAEF", position: "absolute", flexShrink: 1, flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#ECE7F5", borderRadius: 18 }}>
                <SvgXml xml={SVG[6]} width={18} height={18} />
              </View>
              <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Nap started</Text>
                  <View style={{ paddingTop: 2, paddingRight: 7, paddingBottom: 2, paddingLeft: 7, backgroundColor: "#E8ECF1", borderRadius: 999, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#4B5960" }}>Leo</Text></View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", marginLeft: "auto", flexShrink: 1 }}>3:45</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>On the couch after the park</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 12, paddingBottom: 12 }}>
              <View style={{ width: 2, top: 38, left: 17, bottom: -6, backgroundColor: "#E6EAEF", position: "absolute", flexShrink: 1, flexDirection: "column" }}>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#F6E3C6", borderRadius: 18 }}>
                <SvgXml xml={SVG[7]} width={18} height={18} />
              </View>
              <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Snack</Text>
                  <View style={{ paddingTop: 2, paddingRight: 7, paddingBottom: 2, paddingLeft: 7, backgroundColor: "#E8ECF1", borderRadius: 999, flexShrink: 1 }}><Text style={{ fontFamily: font.bodyBold, fontSize: 11, color: "#4B5960" }}>Ava</Text></View>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", marginLeft: "auto", flexShrink: 1 }}>3:30</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Apple slices, crackers · ate all</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 12, paddingBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#DCE7F1", borderRadius: 18 }}>
                <SvgXml xml={SVG[8]} width={18} height={18} />
              </View>
              <View style={{ flexDirection: "column", gap: 2, minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontFamily: font.bodyBold, fontSize: 14, color: "#1B2328", flexShrink: 1 }}>Picked up Ava</Text>
                  <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", marginLeft: "auto", flexShrink: 1 }}>3:24</Text>
                </View>
                <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960", lineHeight: 18 }}>Lincoln Elementary</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, flexShrink: 0, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Photos</Text>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 13, color: "#4B5960", flexShrink: 1 }}>3</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            <View style={{ flexDirection: "column", gap: 4, width: "31.6%", flexShrink: 1 }}>
              <View style={{ height: 104, borderRadius: 10, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>4:32</Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, top: 6, right: 6, backgroundColor: "#FFFFFF", borderRadius: 15, position: "absolute" }}>
                <SvgXml xml={SVG[9]} width={16} height={16} />
              </View>
            </View>
            <View style={{ flexDirection: "column", gap: 4, width: "31.6%", flexShrink: 1 }}>
              <View style={{ height: 104, backgroundColor: "#D7EAD9", borderRadius: 10, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>4:45</Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, top: 6, right: 6, backgroundColor: "#FFFFFF", borderRadius: 15, position: "absolute" }}>
                <SvgXml xml={SVG[10]} width={16} height={16} />
              </View>
            </View>
            <View style={{ flexDirection: "column", gap: 4, width: "31.6%", flexShrink: 1 }}>
              <View style={{ height: 104, backgroundColor: "#F6E3C6", borderRadius: 10, flexDirection: "column" }}>
              </View>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960" }}>5:20</Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 30, height: 30, top: 6, right: 6, backgroundColor: "#FFFFFF", borderRadius: 15, position: "absolute" }}>
                <SvgXml xml={SVG[11]} width={16} height={16} />
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 10, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Notes</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", lineHeight: 20 }}>[Maya's end-of-shift note]</Text>
        </View>
      </View>
    </View>
  );
}
