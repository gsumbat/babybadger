// GENERATED from wireframe P5e-ShiftEditTasks.dc.html by tools/wf2rn/convert.py. Do not edit by hand:
// regenerate, then copy into the real screen and bind data there.
import { Text, TextInput, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { cardShadow, font } from '@/theme';

const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SVG = [
  "<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" style=\"fill: none; stroke: #1B2328; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M15 6l-6 6 6 6\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 20h4L19 9l-4-4L4 16z\"></path><path d=\"M13.5 6.5l4 4\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 20h4L19 9l-4-4L4 16z\"></path><path d=\"M13.5 6.5l4 4\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M4 20h4L19 9l-4-4L4 16z\"></path><path d=\"M13.5 6.5l4 4\"></path></svg>",
  "<svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #47698A; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M12 5v14M5 12h14\"></path></svg>",
  "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" style=\"flex-shrink: 0; fill: none; stroke: #4B5960; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round\"><path d=\"M6 9l6 6 6-6\"></path></svg>"
];

/** Shift · edit tasks */
export default function WF_P5e() {
  return (
    <View style={{ flex: 1, backgroundColor: "#F3F5F8", flexDirection: "column", overflow: "hidden" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 16, paddingRight: 20, paddingBottom: 8, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 44, height: 44, flexShrink: 0, backgroundColor: "#FFFFFF", borderRadius: 22, borderWidth: 1.0, borderColor: "#E6EAEF" }}>{/* -> P6b-CalWeek.dc.html */}
          <SvgXml xml={SVG[0]} width={22} height={22} />
        </View>
        <View style={{ flexDirection: "column", minWidth: 0, flexGrow: 1, flexShrink: 1 }}>
          <Text style={{ fontFamily: font.display, fontSize: 22, color: "#1B2328", marginVertical: -4.62 }}>Booked shift</Text>
          <Text style={{ fontFamily: font.body, fontSize: 13, color: "#4B5960" }}>Thu, Oct 8 · 3:00 PM – 7:00 PM</Text>
        </View>
      </View>
      <View style={{ flexDirection: "column", gap: 12, flexGrow: 1, paddingTop: 4, paddingRight: 20, paddingBottom: 12, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0, backgroundColor: "#47698A", borderRadius: 24 }}>
            <Text style={{ fontFamily: font.display, fontSize: 21, color: "#FFFFFF" }}>M</Text>
          </View>
          <View style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328" }}>Maya</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", lineHeight: 19 }}>Her location starts when she clocks in, not before</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 26, flexShrink: 0, paddingTop: 0, paddingRight: 10, paddingBottom: 0, paddingLeft: 10, backgroundColor: "#DCEEE3", borderRadius: 999 }}>
            <View style={{ width: 7, height: 7, backgroundColor: "#1F8A4D", borderRadius: 4, flexShrink: 1, flexDirection: "column" }}>
            </View>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 12, color: "#1B6B3D" }}>Confirmed</Text>
          </View>
        </View>
        <View style={{ paddingTop: 0, paddingRight: 16, paddingBottom: 0, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, flexDirection: "column", ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#B86A82", borderRadius: 18 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#FFFFFF" }}>A</Text>
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Ava</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 17, marginTop: 2 }}>7 yrs 7 mos</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64, paddingTop: 12, paddingRight: 0, paddingBottom: 12, paddingLeft: 0 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: 36, height: 36, flexShrink: 0, backgroundColor: "#8676B3", borderRadius: 18 }}>
              <Text style={{ fontFamily: font.displayBold, fontSize: 16, color: "#FFFFFF" }}>L</Text>
            </View>
            <View style={{ flexDirection: "column", flexShrink: 1 }}>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328" }}>Leo</Text>
              <Text style={{ fontFamily: font.body, fontSize: 12, color: "#4B5960", lineHeight: 17, marginTop: 2 }}>4 yrs 4 mos · avoid Peanuts, Shellfish</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 4, paddingTop: 14, paddingRight: 16, paddingBottom: 4, paddingLeft: 16, backgroundColor: "#FFFFFF", borderRadius: 24, ...cardShadow }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bodyBold, fontSize: 15, color: "#1B2328", flexShrink: 1 }}>Today’s plan</Text>
            <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", flexShrink: 1 }}>3 tasks</Text>
          </View>
          <View style={{ flexDirection: "column" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
              <View style={{ width: 40, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960" }}>3:15</Text></View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Pick up Ava</Text>
              <SvgXml xml={SVG[1]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
              <View style={{ width: 40, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960" }}>4:10</Text></View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Leave for soccer</Text>
              <SvgXml xml={SVG[2]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, borderBottomWidth: 1.0, borderBottomColor: "#EEF1F4" }}>
              <View style={{ width: 40, flexShrink: 1 }}><Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#4B5960" }}>6:00</Text></View>
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#1B2328", flexGrow: 1, flexShrink: 1 }}>Dinner</Text>
              <SvgXml xml={SVG[3]} width={18} height={18} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 }}>
              <SvgXml xml={SVG[4]} width={20} height={20} />
              <Text style={{ fontFamily: font.bodySemi, fontSize: 15, color: "#47698A", flexShrink: 1 }}>Add task</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", paddingTop: 8, paddingRight: 20, paddingBottom: 32, paddingLeft: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, flexGrow: 1, backgroundColor: "#FFFFFF", borderRadius: 999, borderWidth: 1.5, borderColor: "#C3CCD5", flexShrink: 1 }}>{/* -> P6b-CalWeek.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#1B2328" }}>Cancel shift</Text>
        </View>
      </View>
      <View style={{ backgroundColor: "rgba(27,35,40,0.3)", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "column" }}>
      </View>
      <View style={{ flexDirection: "column", gap: 14, left: 0, right: 0, bottom: 0, paddingTop: 12, paddingRight: 20, paddingBottom: 32, paddingLeft: 20, backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, position: "absolute" }}>
        <View style={{ alignSelf: "center", width: 40, height: 5, backgroundColor: "#C3CCD5", borderRadius: 3, flexDirection: "column" }}>
        </View>
        <View style={{ flexDirection: "column", gap: 2 }}>
          <Text style={{ fontFamily: font.display, fontSize: 24, color: "#1B2328", marginVertical: -4.22 }}>Add a task</Text>
          <Text style={{ fontFamily: font.body, fontSize: 14, color: "#4B5960", lineHeight: 20 }}>Your sitter gets an alert when you save.</Text>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Task</Text>
          <View style={{ flexDirection: "row", alignItems: "center", height: 52, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
            <Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}>Pick up milk</Text>
          </View>
        </View>
        <View style={{ flexDirection: "column", gap: 6 }}>
          <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: "#1B2328" }}>Time (optional)</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 48, paddingTop: 0, paddingRight: 14, paddingBottom: 0, paddingLeft: 14, borderRadius: 8, borderWidth: 1.0, borderColor: "#C3CCD5" }}>
            <Text style={{ fontFamily: font.body, fontSize: 16, color: "#1B2328" }}>4:30 PM</Text>
            <SvgXml xml={SVG[5]} width={18} height={18} />
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, paddingTop: 4, paddingRight: 0, paddingBottom: 4, paddingLeft: 0, backgroundColor: "#F3F5F8", borderRadius: 14 }}>
          <View style={{ height: 32, top: 68, left: 10, right: 10, backgroundColor: "#E1E6EC", borderRadius: 8, position: "absolute", flexShrink: 1, flexDirection: "column" }}>
          </View>
          <View style={{ flexDirection: "row", gap: 8, flexShrink: 1 }}>
            <View style={{ flexDirection: "column", alignItems: "center", width: 48, flexShrink: 1 }}>
              <View style={{ height: 32, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 17, color: "#9AA5AD", lineHeight: 32 }}>2</Text></View>
              <View style={{ height: 32, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 17, color: "#9AA5AD", lineHeight: 32 }}>3</Text></View>
              <View style={{ height: 32, justifyContent: "center" }}><Text style={{ fontFamily: font.bodySemi, fontSize: 20, color: "#1B2328", lineHeight: 32 }}>4</Text></View>
              <View style={{ height: 32, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 17, color: "#9AA5AD", lineHeight: 32 }}>5</Text></View>
              <View style={{ height: 32, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 17, color: "#9AA5AD", lineHeight: 32 }}>6</Text></View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", width: 48, flexShrink: 1 }}>
              <View style={{ height: 32, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 17, color: "#9AA5AD", lineHeight: 32 }}>20</Text></View>
              <View style={{ height: 32, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 17, color: "#9AA5AD", lineHeight: 32 }}>25</Text></View>
              <View style={{ height: 32, justifyContent: "center" }}><Text style={{ fontFamily: font.bodySemi, fontSize: 20, color: "#1B2328", lineHeight: 32 }}>30</Text></View>
              <View style={{ height: 32, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 17, color: "#9AA5AD", lineHeight: 32 }}>35</Text></View>
              <View style={{ height: 32, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 17, color: "#9AA5AD", lineHeight: 32 }}>40</Text></View>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center", width: 48, flexShrink: 1 }}>
              <View style={{ height: 32, flexDirection: "column" }}>
              </View>
              <View style={{ height: 32, justifyContent: "center" }}><Text style={{ fontFamily: font.body, fontSize: 17, color: "#9AA5AD", lineHeight: 32 }}>AM</Text></View>
              <View style={{ height: 32, justifyContent: "center" }}><Text style={{ fontFamily: font.bodySemi, fontSize: 20, color: "#1B2328", lineHeight: 32 }}>PM</Text></View>
              <View style={{ height: 32, flexDirection: "column" }}>
              </View>
              <View style={{ height: 32, flexDirection: "column" }}>
              </View>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", height: 54, backgroundColor: "#47698A", borderRadius: 999 }}>{/* -> P5b-BookedShift.dc.html */}
          <Text style={{ fontFamily: font.displayBold, fontSize: 17, color: "#FFFFFF" }}>Save</Text>
        </View>
      </View>
    </View>
  );
}
