<script setup lang="ts">
import { ref } from 'vue';
import { useDate } from 'vuetify'
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import FullCalendar from './FullCalender.vue';
import CalendarFilters from './CalendarFilters.vue';
const adapter = useDate()

function allowedDates(val: unknown) {
    return parseInt(adapter.toISO(val).split('-')[2], 10) % 2 === 0
}

</script>

<template>
	<v-row>
			<v-col class="d-flex">
        <v-col cols="2" class="d-flex justify-start">
							<CalendarFilters />
					</v-col>
					<v-col cols="10">
							<UiParentCard title="캘린더">
									<FullCalendar />
							</UiParentCard>
					</v-col>
			</v-col>
	</v-row>
</template>
