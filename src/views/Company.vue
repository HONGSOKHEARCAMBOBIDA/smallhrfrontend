<template>
  <div>
    <div class="page-header">
      <el-button
        v-if="canAddCompany"
        type="primary"
        icon="Plus"
        @click="openCreate"
        >បន្ថែមក្រុមហ៑ុន</el-button
      >
    </div>

    <el-card class="table-card">
      <el-table :data="companies" v-loading="loading" stripe border>
        <el-table-column type="index" label="ល.រ" width="70" />
        <el-table-column prop="name" label="ឈ្មោះ" min-width="110" />
        <el-table-column
          prop="user_count"
          label="បុគ្គលិកសរុប"
          min-width="110"
        />
        <el-table-column prop="latitude" label="Latitude" width="120" />
        <el-table-column prop="longitude" label="Longitude" width="120" />
        <el-table-column prop="radius" label="ចម្ងាយអាចស្កែន (m)" width="150" />
        <el-table-column prop="currency" label="រូបិយប័ណ្ណ" width="100" />
        <el-table-column prop="late_penalty" label="ពិន័យយឺត" width="120" />
        <el-table-column
          prop="left_early_penalty"
          label="ពិន័យចេញមុនម៉ោង"
          width="150"
        />
        <el-table-column
          prop="can_scan_outsize"
          label="អាចស្កែនក្រៅតំបន់"
          width="150"
        >
          <template #default="{ row }">
            <el-tag :type="row.can_scan_outsize ? 'success' : 'danger'">
              {{ row.can_scan_outsize ? "បាន" : "មិនបាន" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="ស្ថានភាព" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'danger'" size="small">
              {{ row.is_active ? "Active" : "Inactive" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="សកម្មភាព" width="100">
          <template #default="{ row }">
            <el-button
              v-if="canEditCompany"
              size="small"
              icon="Edit"
              type="warning"
              circle
              @click="openEdit(row)"
            />
            <el-button
              v-if="canEditCompany"
              size="small"
              icon="Promotion"
              type="primary"
              circle
              @click="openEditTelegram(row)"
            />
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @change="fetchCompanies"
        />
      </div>
    </el-card>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? 'កែប្រែក្រុមហ៊ុន' : 'បន្ថែមក្រុមហ៊ុន'"
      width="640px"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="ព័ត៌មានទូទៅ" name="basic">
            <el-form-item label="ឈ្មោះក្រុមហ៊ុន" prop="name">
              <el-input
                v-model.trim="form.name"
                size="large"
                placeholder="បញ្ចូលឈ្មោះក្រុមហ៊ុន"
              />
            </el-form-item>

            <el-form-item label="រូបិយប័ណ្ណសម្រាប់បើកប្រាក់ខែ" prop="currency">
              <el-radio-group v-model="form.currency" size="large">
                <el-radio-button value="USD">USD</el-radio-button>
                <el-radio-button value="KHR">KHR</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="Map Link" prop="map_link">
              <el-input
                v-model.trim="form.map_link"
                size="large"
                placeholder="https://maps.google.com/..."
              />
            </el-form-item>

            <div class="form-row">
              <el-form-item label="Latitude" prop="latitude">
                <el-input
                  v-model.trim="form.latitude"
                  placeholder="e.g. 11.5564"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="Longitude" prop="longitude">
                <el-input
                  v-model.trim="form.longitude"
                  placeholder="e.g. 104.9282"
                  size="large"
                />
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item label="ចម្ងាយអាចស្កែនបាន (ម៉េត្រ)" prop="radius">
                <el-input
                  v-model.trim="form.radius"
                  placeholder="e.g. 100"
                  size="large"
                />
              </el-form-item>
              <el-form-item label="អាចស្កែនក្រៅតំបន់" prop="can_scan_outsize">
                <el-radio-group v-model="form.can_scan_outsize" size="large">
                  <el-radio-button :value="1">អាចស្កែនបាន</el-radio-button>
                  <el-radio-button :value="0">មិនអាចស្កែនបាន</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </div>
          </el-tab-pane>

          <el-tab-pane label="ប្រាក់ពិន័យ" name="penalty">
            <div class="form-row">
              <el-form-item label="ពិន័យពេលមកយឺត" prop="late_penalty">
                <el-input
                  v-model="form.late_penalty"
                  placeholder="ប្រាក់ពិន័យពេលមកយឺត"
                  size="large"
                >
                  <template #append>{{ form.currency }}</template>
                </el-input>
              </el-form-item>
              <el-form-item label="ពិន័យចេញមុនម៉ោង" prop="left_early_penalty">
                <el-input
                  v-model="form.left_early_penalty"
                  placeholder="ប្រាក់ពិន័យពេលចេញមុនម៉ោង"
                  size="large"
                >
                  <template #append>{{ form.currency }}</template>
                </el-input>
              </el-form-item>
            </div>
          </el-tab-pane>

          <!-- TELEGRAM (only on create) -->
          <el-tab-pane label="Telegram" name="telegram" v-if="!isEdit">
            <el-form-item label="Bot Token" prop="bot_token">
              <el-input
                v-model="form.bot_token"
                placeholder="Telegram bot token"
                size="large"
              />
            </el-form-item>
            <el-form-item label="Group Link" prop="group_link">
              <el-input
                v-model="form.group_link"
                placeholder="Telegram group chat ID"
                size="large"
              />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false" size="large"
          >បោះបង់</el-button
        >
        <el-button
          type="primary"
          :loading="saving"
          @click="handleSave"
          size="large"
        >
          {{ isEdit ? "រក្សាទុក" : "បង្កើត" }}
          <el-icon class="el-icon--right"><Upload /></el-icon>
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="dialogTelegramVisible"
      title="កែប្រែ"
      width="600px"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-divider />
        <p class="section-label">Telegram</p>
        <div class="form-row">
          <el-form-item label="Bot Token" prop="bot_token">
            <el-input
              v-model="form.bot_token"
              placeholder="Telegram bot token"
              size="large"
            />
          </el-form-item>
          <el-form-item label="Group Link" prop="group_link">
            <el-input
              v-model="form.group_link"
              placeholder="Telegram group chat ID"
              size="large"
            />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialogTelegramVisible = false" size="large"
          >ថតក្រោយ</el-button
        >
        <el-button
          type="primary"
          :loading="saving"
          @click="handleUpdateTelegram"
          size="large"
        >
          កែប្រែ
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import {
  getCompany,
  createCompany,
  updateCompany,
  updateTelegram,
} from "../api/services";
import { useAuthStore } from "../stores/auth";

const companies = ref([]);
const loading = ref(false);
const saving = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const dialogVisible = ref(false);
const isEdit = ref(false);
const isEditTelegram = ref(false);
const dialogTelegramVisible = ref(false);
const editId = ref(null);
const formRef = ref();
const auth = useAuthStore();

const form = reactive({
  map_link: "",
  name: "",
  latitude: "",
  longitude: "",
  radius: "",
  currency: "",
  late_penalty: "",
  left_early_penalty: "",
  bot_token: "",
  group_link: "",
  can_scan_outsize: null,
});

const canAddCompany = computed(() =>
  auth.permission?.some((p) => p.name === "add.company"),
);
const canEditCompany = computed(() =>
  auth.permission?.some((p) => p.name === "edit.company"),
);
const activeTab = ref("basic");
const rules = {
  name: [{ required: true, message: "Company name is required" }],
  radius: [{ required: true, message: "Radius is required" }],
  group_link: [{ required: true, message: "Group Link is required" }],
  bot_token: [{ required: true, message: "BotToken is required" }],
  currency: [{ required: true, message: "Currency is required" }],
  late_penalty: [{ required: true, message: "Late Penalty required" }],
  left_early_penalty: [
    { required: true, message: "Left Early Penalty required" },
  ],
  can_scan_outsize: [
    { required: true, message: "Employee Can scan outsize or not" },
  ],
};

async function fetchCompanies() {
  loading.value = true;
  try {
    const res = await getCompany({
      page: page.value,
      page_size: pageSize.value,
    });
    companies.value = res.data.data || [];
    total.value = res.data.metadata?.total_count || 0;
  } catch (e) {
    ElMessage.error(e.response?.data?.error);
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  isEdit.value = false;
  Object.keys(form).forEach((k) => (form[k] = ""));
  form.can_scan_outsize = null; // ← add this
  dialogVisible.value = true;
}

function openEdit(row) {
  isEdit.value = true;
  editId.value = row.id;
  Object.assign(form, {
    map_link: "",
    name: row.name || "",
    latitude: row.latitude || "",
    longitude: row.longitude || "",
    radius: row.radius || "",
    currency: row.currency || "",
    bot_token: row.bot_token || "",
    group_link: row.group_link || "",
    late_penalty: row.late_penalty || "",
    left_early_penalty: row.left_early_penalty || "",
    can_scan_outsize: row.can_scan_outsize ?? null,
  });
  dialogVisible.value = true;
}

function openEditTelegram(row) {
  isEditTelegram.value = true;
  editId.value = row.id;
  Object.assign(form, {
    bot_token: row.bot_token || "",
    group_link: row.group_link || "",
  });
  dialogTelegramVisible.value = true;
}

async function handleSave() {
  await formRef.value.validate();
  saving.value = true;
  try {
    if (isEdit.value) {
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== "") payload[k] = v;
      });
      if (form.can_scan_outsize !== null && form.can_scan_outsize !== "") {
        payload.can_scan_outsize = form.can_scan_outsize;
      }
      await updateCompany(editId.value, payload);
      ElMessage.success("កែប្រែបានជោគជ័យ");
    } else {
      await createCompany(form);
      ElMessage.success("បង្កេីតក្រុមហ៑ុនបានជោគជ័យ");
    }
    dialogVisible.value = false;
    fetchCompanies();
  } catch (e) {
    ElMessage.error(e.response?.data?.message || "Failed to save");
  } finally {
    saving.value = false;
  }
}

async function handleUpdateTelegram() {
  await formRef.value.validate();
  saving.value = true;
  try {
    if (isEditTelegram.value) {
      // Send only non-empty fields as nullable update
      const payload = {};
      Object.entries(form).forEach(([k, v]) => {
        if (v !== "") payload[k] = v;
      });
      await updateTelegram(editId.value, payload);
      ElMessage.success("កែប្រែបានជោគជ័យ");
    }
    dialogTelegramVisible.value = false;
    fetchCompanies();
  } catch (e) {
    ElMessage.error(e.response?.data?.error || "Failed to save");
  } finally {
    saving.value = false;
  }
}

onMounted(fetchCompanies);
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.table-card {
  border-radius: 6px;
}

.pagination-wrap {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table__header-wrapper th) {
  background-color: #4589ce !important;
  color: #ffffff !important;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.form-row .el-form-item {
  margin-bottom: 8px;
}

.form-row {
  padding: 10px;
  display: flex;
  gap: 16px;
}
.form-row .el-form-item {
  flex: 1;
  min-width: 0;
}
</style>
